import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, CardType } from '../../domain/entities/card.entity';
import { CreateCardUseCase } from '../../domain/use-cases/card/create-card.use-case';
import { DeleteCardUseCase } from '../../domain/use-cases/card/delete-card.use-case';
import { ListCardsUseCase } from '../../domain/use-cases/card/list-cards.use-case';
import { CardRepository } from '../../infrastructure/repositories/card.repository';
import { useAccount } from './account.provider';
import { useAuth } from './auth.provider';

interface CardContextValue {
  cards: Card[];
  loadingCards: boolean;
  creatingCard: boolean;
  deletingCardId: string | null;
  error: string | null;
  refreshCards: () => Promise<void>;
  createCard: (cardType: CardType, cardholderName: string) => Promise<Card>;
  deleteCard: (cardId: string) => Promise<void>;
  resetCards: () => void;
}

const CardContext = createContext<CardContextValue | undefined>(undefined);

interface CardProviderProps {
  children: ReactNode;
}

const cardRepository = new CardRepository();
const createCardUseCase = new CreateCardUseCase(cardRepository);
const listCardsUseCase = new ListCardsUseCase(cardRepository);
const deleteCardUseCase = new DeleteCardUseCase(cardRepository);

export const CardProvider: React.FC<CardProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { account } = useAccount();
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetCards = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }

    setCards([]);
    setError(null);
    setDeletingCardId(null);
  }, []);

  const refreshCards = useCallback(async () => {
    if (!isAuthenticated) {
      resetCards();
      return;
    }

    if (isMountedRef.current) {
      setLoadingCards(true);
      setError(null);
    }

    try {
      const fetchedCards = await listCardsUseCase.execute(account?.accountNumber);

      if (isMountedRef.current) {
        setCards(fetchedCards);
      }
    } catch (cardsError: any) {
      const errorCode = cardsError?.code;

      if (errorCode === 'functions/not-found' || errorCode === 'not-found') {
        if (isMountedRef.current) {
          setCards([]);
          setError(null);
        }
        return;
      }

      console.error('Erro ao carregar cartões:', cardsError);

      if (isMountedRef.current) {
        setError(cardsError?.message ?? 'Erro ao carregar cartões.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingCards(false);
      }
    }
  }, [isAuthenticated, resetCards, account?.accountNumber]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetCards();
      return;
    }

    let cancelled = false;

    const synchronizeCards = async () => {
      if (cancelled) {
        return;
      }

      await refreshCards();
    };

    synchronizeCards();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshCards, resetCards]);

  const createCard = useCallback(
    async (cardType: CardType, cardholderName: string) => {
      if (!isAuthenticated) {
        throw new Error('É necessário estar autenticado para criar um cartão.');
      }

      if (!account?.accountNumber) {
        throw new Error('Dados da conta não disponíveis.');
      }

      if (isMountedRef.current) {
        setCreatingCard(true);
      }

      try {
        const newCard = await createCardUseCase.execute({
          cardType,
          cardholderName,
          accountNumber: account.accountNumber,
        });

        if (isMountedRef.current) {
          setCards((previous) => {
            const filtered = previous.filter((card) => card.id !== newCard.id);
            return [newCard, ...filtered];
          });
        }

        return newCard;
      } catch (cardCreationError: any) {
        const errorCode = cardCreationError?.code;

        if (errorCode === 'functions/not-found' || errorCode === 'not-found') {
          throw new Error(
            'O serviço de cartões ainda não está disponível. Atualize o aplicativo assim que a funcionalidade for liberada.'
          );
        }

        console.error('Erro ao criar cartão:', cardCreationError);
        throw new Error(
          cardCreationError?.message ?? 'Erro ao criar cartão. Tente novamente mais tarde.'
        );
      } finally {
        if (isMountedRef.current) {
          setCreatingCard(false);
        }
      }
    },
    [isAuthenticated, account?.accountNumber]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      if (!isAuthenticated) {
        throw new Error('É necessário estar autenticado para excluir um cartão.');
      }

      if (!cardId) {
        return;
      }

      if (isMountedRef.current) {
        setDeletingCardId(cardId);
      }

      try {
        await deleteCardUseCase.execute(cardId);

        if (isMountedRef.current) {
          setCards((previous) => previous.filter((card) => card.id !== cardId));
        }
      } catch (deletionError: any) {
        console.error('Erro ao excluir cartão:', deletionError);
        throw new Error(
          deletionError?.message ?? 'Erro ao excluir cartão. Tente novamente mais tarde.'
        );
      } finally {
        if (isMountedRef.current) {
          setDeletingCardId(null);
        }
      }
    },
    [isAuthenticated]
  );

  const value = useMemo<CardContextValue>(
    () => ({
      cards,
      loadingCards,
      creatingCard,
      deletingCardId,
      error,
      refreshCards,
      createCard,
      deleteCard,
      resetCards,
    }),
    [
      cards,
      loadingCards,
      creatingCard,
      deletingCardId,
      error,
      refreshCards,
      createCard,
      deleteCard,
      resetCards,
    ]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
};

export const useCards = (): CardContextValue => {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCards deve ser usado dentro de um CardProvider');
  }

  return context;
};

