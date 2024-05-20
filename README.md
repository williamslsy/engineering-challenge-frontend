# Engineering Challenge Frontend

[GitHub Repository](https://github.com/stakingrewards/engineering-challenge/tree/master)

## Scope of Work

- **Build UI implementation as close to the design as possible**
- **Auto-save user input**
- **Create a reactive UI**
- **Ensure a performant UI with emphasis on a friendly UX**

## Run the App

1. Clone the repository:
   ```bash
   git clone https://github.com/williamslsy/engineering-challenge-frontend
   cd engineering-challenge-frontend
   ```
2. Ensure Node.js is installed.
3. Pull the Docker image and run the server (located [here](https://hub.docker.com/r/stakingrewards/engineering-frontend-challenge)).
4. Run the development server:
   ```bash
   yarn && yarn dev
   ```

The app should now be up and running.

## Tools and Technologies Used

- **Shadcn-UI:** My go-to for consistent UI components and application layout.
- **TypeScript:** For type safety, better code quality, and fewer runtime errors.
- **TailwindCSS:** For atomic design, custom styling, and responsive design.
- **Next.js:** For efficient data fetching and performance through static site generation and caching.
- **React Hooks and Custom Hooks:** For state management and code modularity.
- **Math.js:** For precise formula evaluation within the spreadsheet cells.
- **Lodash:** For utility functions like debouncing to optimize performance.
- **localStorage:** For persisting user data locally.
- **Toast Notifications:** For real-time user feedback on actions.
- **Context API and useReducer hook:** For managing complex state and improving state management predictability and efficiency.

### Structure

- **Spreadsheet Component**: Holds the UI of the app, rendering the table and handling user interactions.
- **SpreadsheetContext**: Contains all functionalities and callback functions, managing the state and logic of the spreadsheet.

- **Custom Hook (useSpreadSheetContext)**: Used to pass context values and functions as props into the app, promoting clean and modular code.

- **Reducers**: Used to manage state updates more efficiently, ensuring better separation of concerns and more predictable state management.

- **Utility Functions (server-utils and utils)**:
  - `server-utils` contains server call functions for saving data and checking processing status.
  - `utils` includes formula evaluation and other utility functions required by the app.

## Core Features and Enhancements

### Building UI as Close to the Design as Possible

**Shadcn-ui and TailwindCSS**:

- Shadcn/Radix-ui was used for consistent UI components.
- I employed TailwindCSS for custom styling and responsive design, ensuring the UI closely matched the provided design.

### Auto-Saving User Input

**Performance Optimization**: Given the current server limitations and issues, I initially implemented a manual save approach to improve experience and performance. However, to meet the task requirements, I opted for a dynamic approach that includes the auto-save feature required.

1. **Local Storage for Persistence**:

   - `localStorage` was used to store user inputs, ensuring data persistence across sessions. This approach minimizes data loss and enhances user experience by maintaining state even when the page is refreshed or when the user revisits.

2. **Debounced Save to Endpoint**:
   - Implemented debouncing using `lodash.debounce` to delay the save operation until the user stops typing for a specified duration, reducing the number of server requests and improving performance.

### Creating a Reactive UI

1. **React Hooks and Custom Hooks**:

   - I leveraged React hooks for state management and custom hooks for encapsulating logic, ensuring a reactive and modular UI.

2. **Memoized Callback Functions**:

   - Used `useCallback` to memoize functions such as `handleSave`, `handleCellValueChange`, `handleBlur`, `handleFocus`, `clearCellValue`, and `updateCellValue`, reducing unnecessary re-renders and enhancing performance.

3. **Error Handling and User Feedback**:
   - Implemented toast notifications for error, progress, and success states, providing immediate feedback to users and ensuring a smooth user experience.

### Ensuring a Performant UI with Emphasis on a Friendly UX

1. **Dynamic Placeholders**:

   - Implemented dynamic placeholders within the spreadsheet cells to guide users on expected input formats. This would improve usability and reduce the likelihood of input errors.

2. **Skeleton Component**:

   - Incorporated a skeleton component to display a loading state while the cells are being initialized from `localStorage`. This enhances the perceived performance and provides a smoother user experience.

3. **Toast notifications**:

   - significantly improves user experience by providing clear guidance and feedback.

4. **Extensive Error Handling**:

   - Implemented strict input validation and robust error handling for formula evaluation, preventing errors like the `Circular Dependency` from breaking the application and ensuring a resilient UI.

5. **Code Maintanability and Optimized State Management with `Context API` and `useReducer`**:

   - Refactored the context provider to use `useReducer` instead of `useState` for managing complex state logic. This allows for better separation of concerns and more efficient state updates, especially for complex state objects like `cellValues`. It also promotes a clean and maintainable codebase, facilitating future enhancements and debugging.

6. **Memoized Context Values**:

   - Utilized `useMemo` to memoize the spreadsheet context value object, ensuring that it only changes when necessary, thus preventing unnecessary re-renders of all components consuming them.

7. **Efficient State Initialization**:
   - Utilized `Array.from` and `reduce` for concise and efficient state initialization, minimizing computational overhead and improving performance.

##### I'm eager to receive feedback on this. Please leave comments on areas for improvement. Thank you.
