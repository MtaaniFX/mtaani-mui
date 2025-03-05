### Example Request:

#### Request Body:
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "principal": 1000.50,
  "inv_type": "locked",
  "locked_months": 12
}
```

#### Response:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "principal": 1000.50,
      "inv_type": "locked",
      "locked_months": 12,
      "status": "active",
      "created_at": "2023-10-01T12:00:00Z",
      "updated_at": "2023-10-01T12:00:00Z"
    }
  ]
}
```