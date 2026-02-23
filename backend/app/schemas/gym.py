from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field


class GymRequest(BaseModel):
    """Gym request model."""

    name: str = Field(..., min_length=2, max_length=100, description="健身房名称")
    location: Optional[str] = Field(None, max_length=200, description="健身房位置")
    address: Optional[str] = Field(None, max_length=200, description="健身房地址")

    def resolved_location(self) -> str:
        raw = self.location if self.location is not None else self.address
        if raw is None:
            return ""
        return raw.strip()


class GymResponse(BaseModel):
    """Gym response model."""

    id: int
    name: str
    location: str

    @computed_field
    @property
    def address(self) -> str:
        return self.location

    model_config = ConfigDict(
        from_attributes=True
    )
