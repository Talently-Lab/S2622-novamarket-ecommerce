import User from "../models/User.js";
import { generateToken } from "../helpers/jwt.js";

class AuthService {
    async createUser(userData) {
        const existingUser = await User.findOne({ email: userData.email });

        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        const user = await User.create(userData);
        const userObject = user.toObject();

        delete userObject.password;

        const token = generateToken(user);

        return { token, user: userObject };
    }

    async loginUser() {

    }

    async getCurrentUser() {

    }

    async logoutUser() {

    }
}

export default new AuthService();