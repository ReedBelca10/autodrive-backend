import { Injectable, Logger, BadRequestException } from '@nestjs/common';
const { FedaPay, Transaction } = require('fedapay');

export interface FedapayTransactionResponse {
    transactionId: string;
    token: string;
    paymentUrl: string;
    status?: string;
}

export interface FedapayTransactionStatus {
    id: string;
    status: string;
    amount: number;
    currency: string;
    description: string;
    metadata: any;
}


@Injectable()
export class FedapayService {
    private readonly logger = new Logger(FedapayService.name);

    constructor() {
        const apiKey = process.env.FEDAPAY_SECRET_KEY;
        const environment = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

        if (!apiKey) {
            this.logger.warn('FEDAPAY_SECRET_KEY is not set. FedaPay payments will not work.');
        }

        FedaPay.setApiKey(apiKey || '');
        FedaPay.setEnvironment(environment);

        this.logger.log(`FedaPay initialized in ${environment} mode`);
    }

    async createTransaction(
        amount: number,
        description: string,
        metadata: any = {}
    ): Promise<FedapayTransactionResponse> {
        try {
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

            this.logger.log(`Creating FedaPay transaction: ${description}, Amount: ${amount} XOF`);

            const transactionPayload = {
                amount,
                currency: {
                    iso: 'XOF'
                },
                description,
                callback_url: `${backendUrl}/reservations/fedapay-callback`,
                redirect_url: `${frontendUrl}/profile/reservations`,
                metadata
            };

            this.logger.log(`FedaPay Transaction Payload:`, JSON.stringify(transactionPayload));

            const transaction = await Transaction.create(transactionPayload);

            this.logger.log(`Transaction created successfully: ${transaction.id}`);

            return {
                transactionId: transaction.id,
                token: transaction.token,
                paymentUrl: transaction.payment_url,
                status: transaction.status
            };
        } catch (error: any) {
            this.logger.error(`Failed to create FedaPay transaction: ${error.message}`, error.stack);
            this.logger.error(`FedaPay Error Details:`, {
                message: error.message,
                status: error.status,
                response: error.response?.data || error.response,
                config: error.config?.data
            });

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException(`Erreur FedaPay lors de la création: ${error.message}`);
        }
    }

    /*
    - **Correction du Bug de Disponibilité**: Résolution du problème "Le véhicule n'est pas disponible pour ces dates".
    - **Securité du Paiement**: Ajout d'une valeur par défaut pour `BACKEND_URL` (`http://localhost:3001`) pour éviter les plantages si la variable est oubliée.
    - **Reporting d'Erreurs**: Le frontend affiche désormais les erreurs précises renvoyées par FedaPay (ex: Erreur 401 si la clé est invalide).
    - **Correction d'Importation**: Résolution de l'erreur `TypeError: FedaPay.setApiKey is not a function`.
    - **Nouveau Module Payments**: Création de `PaymentsModule`.
    - **Endpoints de Suivi**: `POST /reservations/fedapay-callback` et `GET /reservations/:id/fedapay-status`.
    */
    async getTransaction(transactionId: string): Promise<any> {
        try {
            this.logger.log(`Retrieving FedaPay transaction: ${transactionId}`);
            const transaction = await Transaction.retrieve(transactionId);
            return transaction;
        } catch (error: any) {
            this.logger.error(`Failed to retrieve transaction ${transactionId}: ${error.message}`);
            throw new Error(`Erreur lors de la récupération de la transaction: ${error.message}`);
        }
    }

    async getTransactionStatus(transactionId: string): Promise<FedapayTransactionStatus> {
        try {
            const transaction = await this.getTransaction(transactionId);

            return {
                id: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency?.iso || 'XOF',
                description: transaction.description,
                metadata: transaction.metadata
            };
        } catch (error: any) {
            this.logger.error(`Failed to get transaction status: ${error.message}`);
            throw error;
        }
    }

    async verifyTransaction(transactionId: string): Promise<boolean> {
        try {
            const transaction = await this.getTransaction(transactionId);
            const isApproved = transaction.status === 'approved';

            this.logger.log(`Transaction ${transactionId} verification: ${isApproved ? 'APPROVED' : 'NOT APPROVED'} (status: ${transaction.status})`);

            return isApproved;
        } catch (error) {
            this.logger.error(`Failed to verify transaction ${transactionId}`, error);
            return false;
        }
    }
}
