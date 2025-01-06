import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
   res.status(200).json({
        message:"ok"
    })
})

export {registerUser,}














/** In software development, particularly in MVC (Model-View-Controller) architectural patterns, controllers are responsible for handling the logic that connects the application's data (Model) to its user interface (View). They act as intermediaries or "managers" that process user inputs, interact with the data, and determine how to display the response.

Purpose of Controllers
Process User Input:
Controllers handle requests (e.g., HTTP requests in web apps) and determine what actions to take.
Interact with Models:
Controllers fetch or modify data by interacting with the models.
Render Responses:
Controllers send the appropriate data or views (HTML, JSON, etc.) back to the user.
Controllers in MVC
Here's how controllers fit into the MVC architecture:

Model:
Manages the data and business logic of the application.
View:
Displays data and interacts with the user.
Controller:
Handles user requests, processes them, and interacts with the Model and View. */