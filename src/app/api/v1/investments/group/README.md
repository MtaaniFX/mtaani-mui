
### Example Request:

#### Request Body:
```json
{
  "group_name": "My Investment Group",
  "group_description": "A group for long-term investments",
  "inv_type": "locked",
  "locked_months": 12,
  "members": [
    {
      "phone_number": "+1234567890",
      "full_name": "John Doe",
      "national_id_number": "123456789",
      "positions": ["chairman", "admin"]
    },
    {
      "phone_number": "+0987654321",
      "full_name": "Jane Smith",
      "national_id_number": "987654321",
      "positions": ["treasurer"]
    }
  ]
}
```

#### Response:
```json
{
  "groupInvestment": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "owner": "123e4567-e89b-12d3-a456-426614174000",
    "group_name": "My Investment Group",
    "group_description": "A group for long-term investments",
    "inv_type": "locked",
    "locked_months": 12,
    "status": "active",
    "created_at": "2023-10-01T12:00:00Z",
    "updated_at": "2023-10-01T12:00:00Z"
  }
}
```

