import base64
import json
import logging
import os

import httpx

logger = logging.getLogger("voxlate.demo")
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter("%(levelname)s:%(name)s:%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.propagate = False


def clone_voice(audio_file_path, voice_name=None, language_code="en-US"):
    """
    Creates an instant voice clone from an audio sample using Inworld's Voice API.
    Returns the voiceId string, or None on failure.
    """
    api_key = os.getenv("INWORLD_API_KEY")
    if not api_key:
        logger.error("ERROR: INWORLD_API_KEY not set in .env")
        return None

    voice_name = voice_name or os.getenv("INWORLD_VOICE_NAME", "Voxlate_User_Voice")

    try:
        headers = {
            "Authorization": f"Basic {api_key}",
            "Content-Type": "application/json",
        }

        # Read audio file and base64-encode it
        with open(audio_file_path, "rb") as f:
            audio_bytes = f.read()

        audio_b64 = base64.b64encode(audio_bytes).decode("ascii")

        payload = {
            "displayName": voice_name,
            "languageCode": language_code,
            "voiceSamples": [
                {
                    "audioData": audio_b64,
                    "transcription": "Voice sample for cloning.",
                }
            ],
            "description": "Instant voice clone created from user audio sample.",
            "tags": ["demo", "clone"],
            "audioProcessingConfig": {
                "removeBackgroundNoise": True,
            },
        }

        logger.info(
            f"  [API] Cloning voice with Inworld (voice: {voice_name}, file: {audio_file_path})..."
        )

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                "https://api.inworld.ai/voices/v1/voices:clone",
                headers=headers,
                json=payload,
            )

            if response.status_code != 200:
                body = response.read()
                logger.error(
                    f"ERROR: Inworld voice cloning returned {response.status_code}: {body.decode('utf-8', errors='replace')[:500]}"
                )
                return None

            result = response.json()
            voice_id = result.get("voiceId")
            if not voice_id:
                logger.error(f"ERROR: No voiceId in Inworld response: {result}")
                return None

            logger.info(f"  [API] Voice cloned successfully: voiceId={voice_id}")
            return voice_id

    except Exception as e:
        logger.error(f"ERROR: Voice cloning failed: {e}")
        return None


def generate_live_tts(text_to_speak, audio_file_path=None, voice_id=None, output_path="output.mp3"):
    """
    Generates speech using Inworld Inference chat completions with audio (LLM + TTS).
    If audio_file_path is provided and no voice_id, clones the voice first.
    Sends the translated text as a user message; Inworld generates the answer and
    synthesizes it with Inworld TTS in one request.
    """
    api_key = os.getenv("INWORLD_API_KEY")
    if not api_key:
        logger.error("ERROR: INWORLD_API_KEY not set in .env")
        return None

    tts_model = os.getenv("INWORLD_TTS_MODEL", "inworld-tts-2")
    text_model = os.getenv("INWORLD_TEXT_MODEL", "openai/gpt-5.4")

    # If we have an audio file but no voice_id, clone the voice first
    if audio_file_path and not voice_id:
        cloned_voice_id = clone_voice(audio_file_path)
        if cloned_voice_id:
            voice_id = cloned_voice_id
            logger.info(f"  [API] Using cloned voice: {voice_id}")
        else:
            logger.warning("  [WARNING] Voice cloning failed, falling back to default voice")
            voice_id = os.getenv("INWORLD_VOICE_ID", "Dennis")

    voice_id = voice_id or os.getenv("INWORLD_VOICE_ID", "Dennis")

    try:
        headers = {
            "Authorization": f"Basic {api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": text_model,
            "stream": True,
            "audio": {
                "voice": voice_id,
                "model": tts_model,
                "format": "pcm16",
            },
            "messages": [
                {
                    "role": "system",
                    "content": "Speak the user's text exactly as provided. Do not add any additional commentary or explanation.",
                },
                {"role": "user", "content": text_to_speak},
            ],
        }

        logger.info(
            f"  [API] Requesting TTS from Inworld (voice: {voice_id}, tts_model: {tts_model}, text: {text_to_speak[:50]}...)..."
        )

        audio_chunks = []
        full_transcript = ""

        with httpx.Client(timeout=60.0) as client:
            with client.stream(
                "POST",
                "https://api.inworld.ai/v1/chat/completions",
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code != 200:
                    body = response.read()
                    logger.error(
                        f"ERROR: Inworld TTS returned {response.status_code}: {body.decode('utf-8', errors='replace')[:500]}"
                    )
                    return None

                for raw_line in response.iter_lines():
                    if not raw_line:
                        continue
                    line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break

                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue

                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    audio = delta.get("audio")

                    if audio:
                        if "transcript" in audio:
                            transcript = audio["transcript"]
                            full_transcript += transcript
                            logger.info(f"  [TTS transcript]: {transcript}")

                        if "data" in audio:
                            audio_chunks.append(base64.b64decode(audio["data"]))

        if not audio_chunks:
            logger.error("ERROR: No audio data in Inworld response")
            return None

        audio_bytes = b"".join(audio_chunks)

        with open(output_path, "wb") as f:
            f.write(audio_bytes)

        logger.info(f"  [API] Inworld TTS complete: {len(audio_bytes)} bytes written to {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"ERROR: TTS generation failed: {e}")
        return None
