import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, UserEntity, ProfileEntity } from '../services/db.js';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required.' }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' }
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === emailNormalized) {
        return res.status(409).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'An account with this email already exists.' }
        });
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: UserEntity = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: emailNormalized,
      passwordHash,
      role: 'USER',
      createdAt: new Date().toISOString()
    };
    db.users.set(newUser.id, newUser);

    const newProfile: ProfileEntity = {
      id: `prof_${Date.now()}`,
      userId: newUser.id,
      experienceLevel: 'BEGINNER',
      githubUsername: '',
      bio: '',
      weeklyHours: 5,
      skills: ['JavaScript', 'HTML', 'CSS'],
      interests: ['Web Development'],
      updatedAt: new Date().toISOString()
    };
    db.profiles.set(newUser.id, newProfile);

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        profile: newProfile
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Registration failed.' }
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' }
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    let foundUser: UserEntity | undefined;
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === emailNormalized) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const isValid = bcrypt.compareSync(password, foundUser.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const token = generateToken(foundUser);
    const profile = db.profiles.get(foundUser.id);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role
        },
        profile
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Login failed.' }
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const profile = db.profiles.get(user.id);
  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile
    }
  });
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res: Response) => {
  res.clearCookie('token');
  return res.json({
    success: true,
    data: { message: 'Successfully logged out.' }
  });
});

export default router;
