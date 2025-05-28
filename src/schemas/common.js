// src/schemas/common.js
export const sharedSchemas = [
  {
    $id: 'SuccessResponse',
    type: 'object',
    required: ['success', 'message'],
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  {
    $id: 'ErrorResponse',
    type: 'object',
    required: ['success', 'message'],
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
];
