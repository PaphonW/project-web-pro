import React from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import HomePage from './components/homepage'
import manageProduct from './components/manageProduct'
import manageUser from './components/manageUser'
import loginPage from './components/loginPage'
import Header from './components/header'
import Footer from './components/footer'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <>
        <Header/>
        <Switch>
          <Route path="/" exact component={HomePage}></Route>
          <Route path="/login" component={loginPage}></Route>
          <Route path="/manageProduct" component={manageProduct}></Route>
          <Route path="/manageUser" component={manageUser}></Route>
        </Switch>
        <Footer/>
        </>
      </div>
    </BrowserRouter>
    
  );
}

export default App;
