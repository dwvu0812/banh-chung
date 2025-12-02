import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
export declare const getUserDecks: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const getPublicDecks: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const getDeckById: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const createDeck: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const updateDeck: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const deleteDeck: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const addFlashcard: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const updateFlashcard: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const deleteFlashcard: (req: AuthRequest, res: Response) => Promise<Response | void>;
export declare const reviewFlashcard: (req: AuthRequest, res: Response) => Promise<Response | void>;
//# sourceMappingURL=deckController.d.ts.map