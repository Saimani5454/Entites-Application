import { Router } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";

const router = Router();

// GET /user/profile
router.get("/profile", async (req, res) => {
  const email = req.query.email as string;

  // No auth?
  if (!email) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Validate email format
  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const repo = getRepository(User);
  const user = await repo.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
});

export default router;
