"""
AWS Bedrock client for Claude Sonnet and Haiku.

All LLM calls go through AWS Bedrock only (boto3 bedrock-runtime).
We do not use the Anthropic SDK or API directly.
"""

import json
import os
from typing import Any

import boto3
from botocore.config import Config

# Bedrock model IDs (Claude on Bedrock)
SONNET_ID = "anthropic.claude-sonnet-4-6"
HAIKU_ID = "anthropic.claude-haiku-4-5-20251001-v1:0"


def get_bedrock_runtime():
    """Return a Bedrock runtime client with region from env."""
    region = os.getenv("AWS_REGION", "us-east-1")
    return boto3.client(
        "bedrock-runtime",
        region_name=region,
        config=Config(retries={"mode": "standard", "max_attempts": 3}),
    )


def _content_with_image(text: str, image_base64: str | None, media_type: str = "image/jpeg") -> list[dict]:
    """Build content list: text block plus optional image block."""
    content: list[dict] = [{"type": "text", "text": text}]
    if image_base64:
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": image_base64,
            },
        })
    return content


def invoke_claude(
    client: Any,
    model_id: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 2048,
) -> str:
    """
    Invoke Claude via AWS Bedrock (bedrock-runtime). Uses Bedrock's native request
    format; anthropic_version is required by the Bedrock API for Claude models.
    messages: list of {"role": "user"|"assistant", "content": [...]}.
    Content can include type "image" with source.base64 data. Returns assistant text.
    """
    body = {
        "anthropic_version": "bedrock-2023-05-31",  # Bedrock API field for Claude
        "max_tokens": max_tokens,
        "messages": messages,
    }
    response = client.invoke_model(
        modelId=model_id,
        contentType="application/json",
        accept="application/json",
        body=bytes(json.dumps(body), "utf-8"),
    )
    result = json.loads(response["body"].read())
    for block in result.get("content", []):
        if block.get("type") == "text":
            return block.get("text", "")
    return ""


def invoke_claude_with_image(
    client: Any,
    model_id: str,
    user_text: str,
    image_base64: str | None = None,
    max_tokens: int = 2048,
) -> str:
    """Convenience: single user turn, optional image."""
    content = _content_with_image(user_text, image_base64)
    return invoke_claude(
        client,
        model_id,
        messages=[{"role": "user", "content": content}],
        max_tokens=max_tokens,
    )
