import * as service from "../services/users.service.js";

export class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await service.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("[UserController Error]", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await service.findById(id);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("[UserController Error]", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  static async createUser(req, res) {
    try {
      const user = req.body;
      // Helpful debug: log incoming payload (avoid logging sensitive data in prod)
      console.log('[UserController] createUser payload:', JSON.stringify(user));
      // Expect minimal payload: { uid, nombre, email, id_rol }
      const newUser = await service.create(user);
      res.status(201).json(newUser);
    } catch (error) {
      // Log full error with stack for easier debugging
      console.error('[UserController Error]', error && error.stack ? error.stack : error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const user = req.body;
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      const updatedUser = await service.update(id, user);
      if (updatedUser) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("[UserController Error]", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const success = await service.remove(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("[UserController Error]", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}
