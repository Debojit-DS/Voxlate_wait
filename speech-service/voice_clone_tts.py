import base64
import logging
import os
from murf import Murf

logger = logging.getLogger("voxlate.demo")
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter("%(levelname)s:%(name)s:%(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.propagate = False


def generate_live_tts(text_to_speak, audio_file_path=None, voice_id=None, output_path="output.mp3"):
    """
    Generates speech using Murf TTS API.
    text_to_speak: The translated text to speak.
    voice_id: Murf voice ID (e.g., "en-US-natalie").
    audio_file_path: Not used for TTS generation (kept for API compatibility).
    """
    api_key = os.getenv("MURF_API_KEY")
    if not api_key:
        logger.error("ERROR: MURF_API_KEY not set in .env")
        return None

    voice_id = voice_id or os.getenv("MURF_VOICE_ID", "en-US-natalie")

    try:
        client = Murf(api_key=api_key, timeout=30.0)

        logger.info(f"  [API] Requesting TTS from Murf (voice: {voice_id}, text: {text_to_speak[:50]}...)...")
        response = client.text_to_speech.generate(
            format="MP3",
            sample_rate=44100.0,
            text=text_to_speak,
            voice_id=voice_id,
            encode_as_base_64=True,
        )

        # Extract base64 audio from response
        audio_b64 = None
        if hasattr(response, '__dict__'):
            attrs = list(response.__dict__.keys())
            logger.info(f"  [DEBUG] Murf response attributes: {attrs}")
            for attr in ['encoded_audio', 'audio_data', 'audio_base64', 'audio']:
                if attr in attrs:
                    audio_b64 = response.__dict__[attr]
                    logger.info(f"  [DEBUG] Found {attr}: {str(audio_b64)[:50]}...")
                    break
        elif isinstance(response, dict):
            audio_b64 = response.get('encoded_audio') or response.get('audio_data') or response.get('audio_base64')
            logger.info(f"  [DEBUG] Found in dict: {str(audio_b64)[:50] if audio_b64 else None}")

        if not audio_b64:
            logger.error("ERROR: No audio data in Murf response")
            return None

        # Decode base64 and write to file
        audio_bytes = base64_decode(audio_b64)

        with open(output_path, "wb") as f:
            f.write(audio_bytes)

        return output_path

    except Exception as e:
        logger.error(f"ERROR: TTS generation failed: {e}")
        return None


def base64_decode(s):
    """Decode base64 string, handling both str and bytes input."""
    if isinstance(s, str):
        s = s.encode('ascii')
    return base64.b64decode(s)
