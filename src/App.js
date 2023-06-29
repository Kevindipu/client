import "./App.css";
import TextEditor from "./TextEditor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid"

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          exact
          // generate a new documentId using uuid and then the below route takes over
          element={<Navigate to={`/documents/${uuidV4()}`} replace={true} />}
        />
        {/* render the TextEditor for route /document/:id */}
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
