import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-tajny-klucz-auracast-zmien-na-produkcji';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  // Pobieramy token z nagłówka "Authorization: Bearer <token>"
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Brak autoryzacji. Zaloguj się, aby uzyskać dostęp.' });
    return;
  }

  try {
    // Rozszyfrowujemy token i przypisujemy dane użytkownika do obiektu requestu
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded; 
    next(); // Przepuszczamy zapytanie dalej do kontrolera
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy lub wygasły token.' });
  }
};