const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userFound = users.find(u => u.username === username);

  if(!userFound) {
    return response.status(400).json({ error: "User not found. "});
  }

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userFound = users.find(u => u.username === username);

  if(userFound) {
    return response.status(400).json({ error: "User already created. "});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(newUser);

  return response.status(200).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const userFound = users.find(u => u.username === username);
  return response.status(200).json(userFound.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const userFound = users.find(u => u.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  const userUpdated = {
    ...userFound,
    todos: [...userFound.todos, newTodo]
  }

  const userIndex = users.findIndex(u => u.username === username);

  users[userIndex] = userUpdated;

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const user = users.find(u => u.username === username);
  const userIndex = users.findIndex(u => u.username === username);
  const todo = user.todos.find(t => t.id === id);

  if(!todo) {
    return response.status(404).json({ error: "todo not found"});
  }

  const updatedUser = {
    ...user,
    todos: user.todos.map(t => {
      if(t.id === id) return {
        ...t,
        title,
        deadline,
      }

      return t;
    })
  }

  users[userIndex] = updatedUser;

  return response.status(200).json({
    deadline,
    title,
    done: todo.done,
  });

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find(u => u.username === username);
  const userIndex = users.findIndex(u => u.username === username);
  const todo = user.todos.find(t => t.id === id);

  if(!todo) {
    return response.status(404).json({ error: "todo not found"});
  }

  const updatedUser = {
    ...user,
    todos: user.todos.map(t => {
      if(t.id === id) return {
        ...t,
        done: true,
      }

      return t;
    })
  }

  users[userIndex] = updatedUser;

  return response.status(200).json({
    ...todo,
    done: true
  });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find(u => u.username === username);
  const userIndex = users.findIndex(u => u.username === username);
  const todo = user.todos.find(t => t.id === id);
  const todoIndex = user.todos.findIndex(t => t.id === id);

  if(!todo) {
    return response.status(404).json({ error: "todo not found"});
  }

  console.log(user);

  console.log(todo);
  console.log("todo index", todoIndex);

  const updatedUser = {
    ...user,
    todos: user.todos.filter(t => t.id !== id)
  }

  console.log(updatedUser);

  users[userIndex] = updatedUser;

  return response.status(204).send();
});

module.exports = app;