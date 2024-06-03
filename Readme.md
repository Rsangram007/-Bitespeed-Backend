## Project Structure

- `/src`: Root folder of application.
  - `index.js`: The server bootstrap file.
- `/db`: Handles the database connection logic and model definitions.
  - Using PostgresSQL as the database.
- `/routes`: Handles various routes defined in `.routes.js` files.
- `/controller`: Main function in controller.


## Getting Started

To get started with this project, follow these steps:

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd contact-sharing-node`
3. Install dependencies: `npm install`
4. Start the server: `npm  start`

## Usage

Once the server is up and running, you can interact with the API to store and share contact information. Here are some of the available endpoints:


- `localhost:3000/identify`:
  - `POST`: Get the primary contact and details of its linked contacts
  - Request body (JSON): `{ "email": "string", "phoneNumber": "string" }` 