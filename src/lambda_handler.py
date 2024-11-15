import json
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = 'Inventory'
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    # Handle preflight OPTIONS request
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    # Handle GET and POST requests
    if event['httpMethod'] == 'GET':
        return get_inventory(headers)
    elif event['httpMethod'] == 'POST':
        return process_order(event, headers)
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps('Method Not Allowed')
    }

def get_inventory(headers):
    """Retrieve all items from the inventory."""
    try:
        response = table.scan()
        items = response['Items']

        # Directly convert Decimal fields for JSON compatibility
        for item in items:
            if isinstance(item['price'], Decimal):
                item['price'] = float(item['price'])  # Convert Decimal to float
            if isinstance(item['stock'], Decimal):
                item['stock'] = int(item['stock'])    # Convert Decimal to int

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(items)  # JSON serializable
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps(f'Error fetching items: {str(e)}')
        }

def process_order(event, headers):
    """Process an order based on POST data."""
    body = event.get('body')
    if not body:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'message': 'Missing request body', 'status': 'error'})
        }
    
    try:
        # Parse order data
        order_data = json.loads(body)
        item_id = order_data.get('item_id')
        quantity_ordered = order_data.get('quantity', 1)

        if not item_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Missing required field: item_id', 'status': 'error'})
            }

        # Retrieve item by ItemId
        response = table.get_item(Key={'ItemId': item_id})
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'message': 'Item not found', 'status': 'error', 'itemAvailable': False})
            }

        item = response['Item']
        current_stock = item.get('stock', 0)

        # Convert stock and price values if they are Decimal
        if isinstance(current_stock, Decimal):
            current_stock = int(current_stock)  # Convert Decimal to int
        if isinstance(item.get('price'), Decimal):
            item['price'] = float(item['price'])  # Convert Decimal to float

        # Check stock availability
        if current_stock >= quantity_ordered:
            # Update stock after processing the order
            new_stock = current_stock - quantity_ordered
            update_params = {
                'TableName': TABLE_NAME,
                'Key': {'ItemId': item_id},
                'UpdateExpression': 'SET stock = :s',
                'ExpressionAttributeValues': {':s': new_stock},
                'ReturnValues': 'UPDATED_NEW'
            }

            # Update stock in DynamoDB
            table.update_item(**update_params)

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Order processed successfully',
                    'status': 'success',
                    'item_id': item_id,
                    'itemAvailable': True,
                    'availableStock': new_stock
                })
            }
        else:
            # Insufficient stock
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'message': f'Insufficient stock. Only {current_stock} items available, Try again.',
                    'status': 'error',
                    'itemAvailable': False,
                    'availableStock': current_stock
                })
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': f'Error processing order: {str(e)}', 'status': 'error'})
        }
