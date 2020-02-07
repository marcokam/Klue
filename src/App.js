import "./tachyons.min.css";
import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import { Search } from "./components/Search/Search";


function App() {
    return (
        <Router>
            <Switch>
                <Route path="/search/:searchTerm?">
                    <Search />
                </Route>
                <Route path="/">
                    <Redirect to="/search" />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
