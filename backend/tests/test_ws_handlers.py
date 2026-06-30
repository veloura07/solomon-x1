import sys
import json
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

# Create a fixture that patches sys.modules
# Note: we are patching `sys.modules` only for the duration of the module/tests
sys_modules_patcher = patch.dict('sys.modules', {
    'backend.config': MagicMock(),
    'backend.emotion_engine': MagicMock(),
    'backend.ollama_client': MagicMock(),
    'backend.ring_engine': MagicMock(),
    'backend.conversation': MagicMock(),
})
sys_modules_patcher.start()

# Now we can import it safely
from backend.ws_handlers import _handle_ring_selected, _SessionState

@pytest.fixture(autouse=True, scope="session")
def cleanup_sys_modules():
    yield
    sys_modules_patcher.stop()


@pytest.fixture
def mock_websocket():
    ws = AsyncMock()
    return ws

@pytest.mark.asyncio
async def test_handle_ring_selected_success(mock_websocket):
    session = _SessionState()
    session.abort_requested = True # Start with True to verify it gets reset

    data = {"ring_id": "test_ring"}

    mock_ring_cfg = {"display_name": "Test Ring", "model": "test_model"}
    mock_models = ["model1", "model2"]

    with patch("backend.ws_handlers.config.get_ring_config", return_value=mock_ring_cfg) as mock_get_config, \
         patch("backend.ws_handlers.ollama_client.list_models", new_callable=AsyncMock) as mock_list_models:

        mock_list_models.return_value = mock_models

        await _handle_ring_selected(data, mock_websocket, session)

        # Verify state
        assert session.active_ring_id == "test_ring"
        assert session.abort_requested is False

        # Verify calls
        mock_get_config.assert_called_once_with("test_ring")
        mock_list_models.assert_awaited_once()

        # Verify websocket sends
        assert mock_websocket.send.await_count == 2

        call1 = mock_websocket.send.await_args_list[0][0][0]
        payload1 = json.loads(call1)
        assert payload1 == {
            "event": "ring_config",
            "ring_id": "test_ring",
            "config": mock_ring_cfg
        }

        call2 = mock_websocket.send.await_args_list[1][0][0]
        payload2 = json.loads(call2)
        assert payload2 == {
            "event": "models",
            "list": mock_models
        }

@pytest.mark.asyncio
async def test_handle_ring_selected_error(mock_websocket):
    session = _SessionState()

    data = {"ring_id": "invalid_ring"}

    with patch("backend.ws_handlers.config.get_ring_config", side_effect=KeyError("Ring not found")) as mock_get_config:
        await _handle_ring_selected(data, mock_websocket, session)

        # Verify state remains unchanged
        assert session.active_ring_id is None

        # Verify calls
        mock_get_config.assert_called_once_with("invalid_ring")

        # Verify websocket sends error
        mock_websocket.send.assert_awaited_once()
        call = mock_websocket.send.await_args[0][0]
        payload = json.loads(call)

        assert payload["event"] == "error"
        assert "Ring not found" in payload["message"]
