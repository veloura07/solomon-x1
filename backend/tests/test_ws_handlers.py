import json
import logging
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def mock_backend_modules():
    mock_config = MagicMock()
    mock_emotion_engine = MagicMock()
    mock_ollama_client = AsyncMock()
    mock_ring_engine = AsyncMock()
    mock_conversation = MagicMock()

    # We create a dummy ConversationManager class
    class DummyConversationManager:
        def __init__(self):
            self.clear = MagicMock()

    mock_conversation.ConversationManager = DummyConversationManager

    modules = {
        "backend.config": mock_config,
        "backend.emotion_engine": mock_emotion_engine,
        "backend.ollama_client": mock_ollama_client,
        "backend.ring_engine": mock_ring_engine,
        "backend.conversation": mock_conversation,
    }

    with patch.dict("sys.modules", modules):
        yield modules


@pytest.fixture
def mock_ws():
    ws = AsyncMock()
    return ws


@pytest.fixture
def mock_conv_manager(mock_backend_modules):
    from backend.conversation import ConversationManager
    return ConversationManager()


@pytest.mark.asyncio
async def test_handle_unknown_event(mock_ws, mock_conv_manager):
    from backend.ws_handlers import handle_message

    data = {"event": "unknown_event"}
    await handle_message(data, mock_ws, mock_conv_manager)

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])

    assert sent_data["event"] == "error"
    assert "Unknown event type" in sent_data["message"]


@pytest.mark.asyncio
async def test_handle_ring_selected_success(mock_ws, mock_conv_manager, mock_backend_modules):
    from backend.ws_handlers import handle_message, _SessionState

    mock_config = mock_backend_modules["backend.config"]
    mock_config.get_ring_config.return_value = {"display_name": "Test Ring", "model": "test-model"}

    mock_ollama_client = mock_backend_modules["backend.ollama_client"]
    mock_ollama_client.list_models.return_value = ["test-model", "other-model"]

    session = _SessionState()
    session.abort_requested = True

    data = {"event": "ring_selected", "ring_id": "test_ring_id"}
    await handle_message(data, mock_ws, mock_conv_manager, session=session)

    assert session.active_ring_id == "test_ring_id"
    assert session.abort_requested is False

    assert mock_ws.send.call_count == 2

    # Check ring config sent
    args1, _ = mock_ws.send.call_args_list[0]
    sent_data1 = json.loads(args1[0])
    assert sent_data1["event"] == "ring_config"
    assert sent_data1["ring_id"] == "test_ring_id"
    assert sent_data1["config"]["display_name"] == "Test Ring"

    # Check models sent
    args2, _ = mock_ws.send.call_args_list[1]
    sent_data2 = json.loads(args2[0])
    assert sent_data2["event"] == "models"
    assert sent_data2["list"] == ["test-model", "other-model"]


@pytest.mark.asyncio
async def test_handle_ring_selected_error(mock_ws, mock_conv_manager, mock_backend_modules):
    from backend.ws_handlers import handle_message

    mock_config = mock_backend_modules["backend.config"]
    mock_config.get_ring_config.side_effect = KeyError("Ring not found")

    data = {"event": "ring_selected", "ring_id": "invalid_ring"}
    await handle_message(data, mock_ws, mock_conv_manager)

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "error"
    assert "Ring not found" in sent_data["message"]


@pytest.mark.asyncio
async def test_handle_abort(mock_ws, mock_conv_manager):
    from backend.ws_handlers import handle_message, _SessionState

    session = _SessionState()
    assert session.abort_requested is False

    data = {"event": "abort_generation"}
    await handle_message(data, mock_ws, mock_conv_manager, session=session)

    assert session.abort_requested is True

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "status"
    assert sent_data["state"] == "idle"


@pytest.mark.asyncio
async def test_handle_clear_history_success(mock_ws, mock_conv_manager):
    from backend.ws_handlers import handle_message

    data = {"event": "clear_history", "ring_id": "test_ring"}
    await handle_message(data, mock_ws, mock_conv_manager)

    mock_conv_manager.clear.assert_called_once_with("test_ring")

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "status"
    assert sent_data["state"] == "idle"


@pytest.mark.asyncio
async def test_handle_clear_history_missing_ring_id(mock_ws, mock_conv_manager):
    from backend.ws_handlers import handle_message

    data = {"event": "clear_history"}
    await handle_message(data, mock_ws, mock_conv_manager)

    mock_conv_manager.clear.assert_not_called()

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "error"
    assert "requires a 'ring_id'" in sent_data["message"]


@pytest.mark.asyncio
async def test_handle_user_message_no_ring(mock_ws, mock_conv_manager):
    from backend.ws_handlers import handle_message

    data = {"event": "user_message", "content": "Hello"}
    await handle_message(data, mock_ws, mock_conv_manager)

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "error"
    assert "No ring selected" in sent_data["message"]


@pytest.mark.asyncio
async def test_handle_user_message_empty_content(mock_ws, mock_conv_manager):
    from backend.ws_handlers import handle_message

    data = {"event": "user_message", "ring_id": "test_ring", "content": "   "}
    await handle_message(data, mock_ws, mock_conv_manager)

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "error"
    assert "cannot be empty" in sent_data["message"]


@pytest.mark.asyncio
async def test_handle_user_message_success(mock_ws, mock_conv_manager, mock_backend_modules):
    from backend.ws_handlers import handle_message, _SessionState

    mock_ring_engine = mock_backend_modules["backend.ring_engine"]
    mock_emotion_engine = mock_backend_modules["backend.emotion_engine"]

    mock_emotion_engine.analyze.return_value = {"valence": 0.8, "arousal": 0.5}

    async def mock_process_message(ring_id, user_message, conversation_manager, on_token):
        await on_token("Hello")
        await on_token(" World")
        return "Hello World"

    mock_ring_engine.process_message.side_effect = mock_process_message

    session = _SessionState()
    session.active_ring_id = "test_ring"

    data = {"event": "user_message", "content": "Hi"}
    await handle_message(data, mock_ws, mock_conv_manager, session=session)

    assert mock_ws.send.call_count == 6

    sent_events = [json.loads(call_args[0][0]) for call_args in mock_ws.send.call_args_list]

    assert sent_events[0] == {"event": "status", "state": "thinking"}
    assert sent_events[1] == {"event": "token_stream", "token": "Hello", "done": False}
    assert sent_events[2] == {"event": "token_stream", "token": " World", "done": False}
    assert sent_events[3] == {"event": "token_stream", "token": "", "done": True}
    assert sent_events[4] == {"event": "emotion_update", "ring_id": "test_ring", "valence": 0.8, "arousal": 0.5}
    assert sent_events[5] == {"event": "status", "state": "idle"}


@pytest.mark.asyncio
async def test_handle_user_message_aborted(mock_ws, mock_conv_manager, mock_backend_modules):
    from backend.ws_handlers import handle_message, _SessionState

    mock_ring_engine = mock_backend_modules["backend.ring_engine"]

    session = _SessionState()
    session.active_ring_id = "test_ring"

    async def mock_process_message(ring_id, user_message, conversation_manager, on_token):
        await on_token("Hello")
        # Simulate abort requested mid-stream
        session.abort_requested = True
        await on_token(" World")
        return ""

    mock_ring_engine.process_message.side_effect = mock_process_message

    data = {"event": "user_message", "content": "Hi"}
    await handle_message(data, mock_ws, mock_conv_manager, session=session)

    # We expect:
    # 1. status -> thinking
    # 2. token_stream -> Hello (done=False)
    # The third token_stream should be ignored due to abort requested
    # We do NOT send done=True because it was aborted
    # We DO send status -> idle at the end

    sent_events = [json.loads(call_args[0][0]) for call_args in mock_ws.send.call_args_list]

    assert len(sent_events) == 3
    assert sent_events[0] == {"event": "status", "state": "thinking"}
    assert sent_events[1] == {"event": "token_stream", "token": "Hello", "done": False}
    assert sent_events[2] == {"event": "status", "state": "idle"}


@pytest.mark.asyncio
async def test_handle_user_message_stream_failure(mock_ws, mock_conv_manager, mock_backend_modules):
    from backend.ws_handlers import handle_message, _SessionState

    mock_ring_engine = mock_backend_modules["backend.ring_engine"]

    async def mock_process_message(ring_id, user_message, conversation_manager, on_token):
        await on_token("Hello")
        await on_token(None) # Signal failure
        return ""

    mock_ring_engine.process_message.side_effect = mock_process_message

    session = _SessionState()
    session.active_ring_id = "test_ring"

    data = {"event": "user_message", "content": "Hi"}
    await handle_message(data, mock_ws, mock_conv_manager, session=session)

    sent_events = [json.loads(call_args[0][0]) for call_args in mock_ws.send.call_args_list]

    assert sent_events[0] == {"event": "status", "state": "thinking"}
    assert sent_events[1] == {"event": "token_stream", "token": "Hello", "done": False}
    assert sent_events[2]["event"] == "error"
    assert "stream failed" in sent_events[2]["message"]
    # Still finishes done=True since it wasn't aborted, just stream failed? No, wait:
    # Ah, the code sends done=True unconditionally unless session.abort_requested
    assert sent_events[3] == {"event": "token_stream", "token": "", "done": True}
    assert sent_events[4] == {"event": "status", "state": "idle"}


@pytest.mark.asyncio
async def test_top_level_exception_handling(mock_ws, mock_conv_manager, caplog):
    from backend.ws_handlers import handle_message

    # We'll make clear_history raise an exception to test the top-level try-except
    data = {"event": "clear_history", "ring_id": "test_ring"}

    mock_conv_manager.clear.side_effect = RuntimeError("Something bad happened")

    with caplog.at_level(logging.ERROR):
        await handle_message(data, mock_ws, mock_conv_manager)

    assert "Unhandled exception in event 'clear_history': Something bad happened" in caplog.text

    mock_ws.send.assert_called_once()
    args, _ = mock_ws.send.call_args
    sent_data = json.loads(args[0])
    assert sent_data["event"] == "error"
    assert "Internal server error" in sent_data["message"]

@pytest.mark.asyncio
async def test_top_level_exception_handling_ws_closed(mock_ws, mock_conv_manager, caplog):
    from backend.ws_handlers import handle_message

    data = {"event": "clear_history", "ring_id": "test_ring"}

    # First, make the handler crash to trigger the top-level except block
    mock_conv_manager.clear.side_effect = RuntimeError("Original crash")

    # Then, make mock_ws.send raise an Exception to trigger the nested except block
    mock_ws.send.side_effect = Exception("WebSocket closed")

    with caplog.at_level(logging.ERROR):
        await handle_message(data, mock_ws, mock_conv_manager)

    assert "Unhandled exception in event 'clear_history': Original crash" in caplog.text
    # Should silently discard the Exception from _send and return cleanly
