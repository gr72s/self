from app.core.exceptions import DataWriteException


def test_create_gym_returns_data_write_error(client, monkeypatch):
    def mock_create(*args, **kwargs):
        raise DataWriteException()

    monkeypatch.setattr("app.services.gym.GymService.create", mock_create)

    response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置",
        },
    )

    assert response.status_code == 500
    payload = response.json()
    assert payload["detail"] == "数据写入失败"


def test_update_gym_returns_data_write_error(client, monkeypatch):
    def mock_update(*args, **kwargs):
        raise DataWriteException()

    monkeypatch.setattr("app.services.gym.GymService.update", mock_update)

    response = client.put(
        "/api/lifting/gym/1",
        json={
            "name": "测试健身房",
            "location": "测试位置",
        },
    )

    assert response.status_code == 500
    payload = response.json()
    assert payload["detail"] == "数据写入失败"
