import { Request, Response, NextFunction } from 'express';

export const validRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, password } = req.body;

    const errors: string[] = [];

    if (!name) {
        errors.push("Please enter your name");
    } else if (name.length > 20) {
        errors.push("Your name is up to 20 chars long.");
    }

    if (!email) {
        errors.push("Please enter your email");
    } else if (!validateEmail(email)) {
        errors.push("Email format is incorrect.");
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 chars.");
    }

    if (errors.length > 0) {
        res.status(400).json({ 
            msg: errors 
        });
    }

    next();
};

export function validateEmail(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
