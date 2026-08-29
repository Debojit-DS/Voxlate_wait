import os
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import base64
import json

# Import helper functions
from transcribe_stt import transcribe_audio_groq
from translate import translate_text_groq
from voice_clone_tts import onboard_user_voice, generate_live_tts

load_dotenv()

app = FastAPI()

#CronJob ping
@app.get("/ping")
async def ping():
    return {"message": "Server is awake"}

# MongoDB Configuration
MONGO_URI = os.getenv("DATABASE_URL")
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client["voxlate_db"]
users_collection = db["users"]


async def handle_error(ws: WebSocket):
    """Helper to send error status and close connection gracefully."""
    try:
        await ws.send_text("error")
        await ws.send_text("closing connection")
        await ws.close()
    except Exception:
        pass # If the socket is already closed, silently ignore to prevent cascading crashes


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    permit = False
    email = ""
    
    # Initialize filenames as None so the 'finally' block doesn't fail
    filename = None
    output_filename = None

    try:
        msg = await ws.receive_text()

        if msg.startswith("email: "):
            email = msg.replace(" ", "").replace("email:", "").lower()
            user = await users_collection.find_one({"email": email})

            if user:
                if user.get("count", 0) >= 5:
                    await ws.send_text("denied")
                else:
                    await ws.send_text("permitted")
                    await users_collection.update_one(
                        {"email": email},
                        {"$inc": {"count": 1}}
                    )
                    permit = True
            else:
                await users_collection.insert_one({
                    "email": email,
                    "count": 1,
                    "ref_id": None
                })
                await ws.send_text("permitted")
                permit = True

        if permit:
            audio_data = await ws.receive_bytes()
            target_lang = (await ws.receive_text()).replace("lang: ", "")
            
            # UNIQUE ID: Ensures no two files ever share the same name, preventing collisions
            session_id = str(uuid.uuid4())
            filename = f"{email}_{session_id}.wav"
            output_filename = f"{email}_{session_id}.output.wav"

            def save_audio(name, data):
                with open(name, "wb") as f:
                    f.write(data)
            await asyncio.to_thread(save_audio, filename, audio_data)

            # 1. Speech to Text
            transcribed_audio = await asyncio.to_thread(transcribe_audio_groq, filename)
            if transcribed_audio is None:
                return await handle_error(ws)

            text = transcribed_audio["text"]
            lang = transcribed_audio["language"]

            # 2. Text Translation
            translated_text = await asyncio.to_thread(translate_text_groq, text, target_lang)
            if translated_text is None:
                return await handle_error(ws)

            user_data = await users_collection.find_one({"email": email})
            ref_id = user_data.get("ref_id") if user_data else None

            # 3. Voice Profile Onboarding
            if not ref_id:
                ref_id = await asyncio.to_thread(onboard_user_voice, filename)
                if ref_id is None:
                    return await handle_error(ws)

                await users_collection.update_one(
                    {"email": email},
                    {"$set": {"ref_id": ref_id}}
                )

            # 4. Text to Speech Generation
            output_path = await asyncio.to_thread(
                generate_live_tts, 
                translated_text, 
                ref_id, 
                output_filename
            )

            if output_path is None:
                return await handle_error(ws)

            # Send back generated audio bytes
            def read_audio(name):
                with open(name, "rb") as f:
                    return f.read()
            
            output_bytes = await asyncio.to_thread(read_audio, output_filename)
            encoded_audio = base64.b64encode(output_bytes).decode('utf-8')

            # Package the text and audio into a single JSON payload
            payload = {
                "status": "success",
                "original_text": text,
                "translated_text": translated_text,
                "audio_base64": encoded_audio
            }

            await ws.send_text(json.dumps(payload))

        await ws.send_text("closing connection")
        await ws.close()

    except WebSocketDisconnect:
        print(f"Client disconnected: {email}")
    except Exception as e:
        print(f"Unexpected error for {email}: {e}")
        await handle_error(ws)
        
    finally:
        # THE GUARANTEE: This block runs NO MATTER WHAT.
        # Even if a function returns early, or the server throws an error, 
        # these files will be wiped from your Render disk.
        if filename and os.path.exists(filename):
            os.remove(filename)
        if output_filename and os.path.exists(output_filename):
            os.remove(output_filename)