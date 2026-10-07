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

    async loginUser(userData) {
        const { email, password } = userData;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new Error('Credenciales inválidas');
        }

        const userObject = user.toObject();

        delete userObject.password;

        const token = generateToken(user);

        return { token, user: userObject };
    }

    async getCurrentUser() {

    }

    async logoutUser() {

    }
}

export default new AuthService();