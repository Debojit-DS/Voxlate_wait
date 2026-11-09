"""Recorded-clip demo. The planned streaming desktop pipeline is separate."""
import asyncio
import base64
import logging
import os
from pathlib import Path
from tempfile import TemporaryDirectory

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument

from transcribe_stt import transcribe_audio_groq
from translate import translate_text_groq
from voice_clone_tts import generate_live_tts

load_dotenv()
app = FastAPI()

allowed_origins_list = [value.strip() for value in os.getenv("FRONTEND_URL", "http://localhost:3002").split(",") if value.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger = logging.getLogger("voxlate.demo")
mongo_client = AsyncIOMotorClient(os.getenv("DATABASE_URL"), serverSelectionTimeoutMS=5000)
users_collection = mongo_client[os.getenv("DEMO_DATABASE_NAME", "voxlate_db")]["users"]
LANGUAGES = {"en", "es", "fr", "de", "bn", "ta", "hi", "ja", "zh", "ar"}
MAX_AUDIO_BYTES = 10 * 1024 * 1024


def verify_demo_ticket(message: str):
    secret = os.getenv("JWT_SECRET", "")
    if len(secret) < 16 or not message.startswith("auth: "):
        raise ValueError("Signed demo access required")
    claims = jwt.decode(message[6:], secret, algorithms=["HS256"], audience="voxlate-demo",
                        issuer="voxlate-web", options={"require": ["sub", "email", "exp", "iat", "aud", "iss"]})
    if not isinstance(claims["sub"], str) or not claims["sub"] or not isinstance(claims["email"], str):
        raise ValueError("Invalid identity")
    return claims


@app.get("/ping")
async def ping():
    return {"status": "success", "service": "voxlate-demo"}


async def status_and_close(ws, status):
    try:
        await ws.send_text(status)
        await ws.close()
    except (WebSocketDisconnect, RuntimeError):
        pass


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    allowed_origins = {value.strip() for value in os.getenv("FRONTEND_URL", "http://localhost:3002").split(",")}
    if ws.headers.get("origin") not in allowed_origins:
        await ws.send_text("unauthorized")
        await ws.close()
        return

    identity = None
    reserved = False
    completed = False
    try:
        try:
            message = await asyncio.wait_for(ws.receive_text(), 10)
        except asyncio.TimeoutError:
            return await status_and_close(ws, "unauthorized")

        if message.startswith("auth: "):
            try:
                claims = verify_demo_ticket(message)
            except (ValueError, jwt.PyJWTError):
                return await status_and_close(ws, "unauthorized")
            identity = claims["sub"]
            email = claims["email"]
        elif message.startswith("email: "):
            email = message[7:].strip()
            if not email:
                return await status_and_close(ws, "unauthorized")
            identity = email
        else:
            # Accept a bare JWT token (no "auth: " prefix) as sent by the frontend
            try:
                claims = verify_demo_ticket("auth: " + message)
            except (ValueError, jwt.PyJWTError):
                return await status_and_close(ws, "unauthorized")
            identity = claims["sub"]
            email = claims["email"]

        legacy = await users_collection.find_one({"email": email})
        logger.info(f"Demo auth: identity={identity}, email={email}, legacy_count={(legacy or {}).get('count', 0)}")
        await users_collection.update_one({"_id": identity}, {"$setOnInsert": {
            "email": email, "count": (legacy or {}).get("count", 0), "ref_id": (legacy or {}).get("ref_id")
        }}, upsert=True)
        await ws.send_text("permitted")
        audio_data = await asyncio.wait_for(ws.receive_bytes(), 15)
        language_message = await asyncio.wait_for(ws.receive_text(), 5)
        logger.info(f"Demo: audio_bytes={len(audio_data) if audio_data else 0}, lang_msg={language_message}")
        if not audio_data or len(audio_data) > MAX_AUDIO_BYTES or not language_message.startswith("lang: "):
            logger.warning("Demo: audio or language validation failed")
            return await status_and_close(ws, "error")
        target_lang = language_message[6:]
        if target_lang not in LANGUAGES:
            logger.warning(f"Demo: unsupported language {target_lang}")
            return await status_and_close(ws, "error")
        user = await users_collection.find_one_and_update(
            {"_id": identity, "count": {"$lt": 5}}, {"$inc": {"count": 1}}, return_document=ReturnDocument.AFTER)
        logger.info(f"Demo: user lookup result: {user}")
        if not user:
            return await status_and_close(ws, "denied")
        reserved = True
        with TemporaryDirectory(prefix="voxlate-demo-") as directory:
            filename = str(Path(directory) / "input.webm")
            output_filename = str(Path(directory) / "output.wav")
            Path(filename).write_bytes(audio_data)
            async with asyncio.timeout(80):
                logger.info(f"Demo: starting transcription for {filename}")
                transcript = await asyncio.to_thread(transcribe_audio_groq, filename)
                logger.info(f"Demo: transcription result: {transcript}")
                if not transcript or not isinstance(transcript.get("text"), str) or not transcript["text"].strip():
                    logger.warning("Demo: transcription failed")
                    return await status_and_close(ws, "error")
                logger.info(f"Demo: starting translation to {target_lang}")
                translated = await asyncio.to_thread(translate_text_groq, transcript["text"], target_lang)
                logger.info(f"Demo: translation result: {translated}")
                if not isinstance(translated, str) or not translated.strip():
                    logger.warning("Demo: translation failed")
                    return await status_and_close(ws, "error")
                voice_id = os.getenv("INWORLD_VOICE_ID", "Dennis")
                logger.info(f"Demo: generating TTS with Inworld voice {voice_id} for output {output_filename}")
                output = await asyncio.to_thread(generate_live_tts, translated, None, voice_id, output_filename)
                logger.info(f"Demo: TTS result: {output}")
                if not output:
                    return await status_and_close(ws, "error")
                output_bytes = Path(output).read_bytes()
                if not output_bytes or len(output_bytes) > 16 * 1024 * 1024:
                    return await status_and_close(ws, "error")
                await ws.send_json({"status": "success", "original_text": transcript["text"],
                                    "translated_text": translated, "audio_base64": base64.b64encode(output_bytes).decode("ascii")})
                completed = True
        await ws.close()
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.warning("Demo request failed", exc_info=True)
        await status_and_close(ws, "error")
    finally:
        if reserved and not completed:
            try:
                await users_collection.update_one({"_id": identity, "count": {"$gt": 0}}, {"$inc": {"count": -1}})
            except Exception:
                logger.warning("Demo allowance refund failed", exc_info=False)
