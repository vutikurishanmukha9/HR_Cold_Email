const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
    details?: any;
}

class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        // Load token from localStorage
        this.token = localStorage.getItem('accessToken');
    }

    setToken(token: string | null) {
        this.token = token;
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
            });

            let data: any;
            const contentType = response.headers.get('content-type');

            // Try to parse JSON response
            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { error: 'Invalid JSON response from server' };
                }
            } else {
                const text = await response.text();
                data = { error: text || 'Unexpected server response' };
            }

            if (!response.ok) {
                // Extract error message from various possible formats
                // Backend returns: { success: false, error: { message: "...", code: "...", type: "..." } }
                let errorMessage = `Server error: ${response.status} ${response.statusText}`;

                if (data?.error?.message) {
                    // Nested error object format
                    errorMessage = data.error.message;
                } else if (typeof data?.error === 'string') {
                    // Simple error string
                    errorMessage = data.error;
                } else if (data?.message) {
                    // Direct message property
                    errorMessage = data.message;
                }

                throw new Error(errorMessage);
            }

            return data;
        } catch (error: any) {
            // Handle network errors and other fetch failures
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error: Unable to connect to server');
        }
    }

    // Auth endpoints
    async register(email: string, password: string, fullName: string) {
        const data = await this.request<{
            user: any;
            accessToken: string;
            refreshToken: string;
        }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName }),
        });
        this.setToken(data.accessToken);
        return data;
    }

    async login(email: string, password: string) {
        const data = await this.request<{
            user: any;
            accessToken: string;
            refreshToken: string;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.accessToken);
        return data;
    }

    async getMe() {
        return this.request<{ user: any }>('/auth/me');
    }

    // Credential endpoints
    async saveCredential(email: string, appPassword: string, isDefault?: boolean) {
        return this.request<{ credential: any }>('/credentials', {
            method: 'POST',
            body: JSON.stringify({ email, appPassword, isDefault }),
        });
    }

    async getCredentials() {
        return this.request<{ credentials: any[] }>('/credentials');
    }

    async deleteCredential(id: string) {
        return this.request<{ message: string }>(`/credentials/${id}`, {
            method: 'DELETE',
        });
    }

    // Campaign endpoints
    async createCampaign(data: {
        name: string;
        subject: string;
        body: string;
        recipients: any[];
        scheduledTime?: string;
        batchSize?: number;
        batchDelay?: number;
    }) {
        return this.request<{ campaign: any }>('/campaigns', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCampaigns(params?: { page?: number; limit?: number; status?: string }) {
        const query = new URLSearchParams(params as any).toString();
        return this.request<{
            campaigns: any[];
            total: number;
            page: number;
            totalPages: number;
        }>(`/campaigns?${query}`);
    }

    async getCampaign(id: string) {
        return this.request<{ campaign: any }>(`/campaigns/${id}`);
    }

    async updateCampaign(id: string, data: any) {
        return this.request<{ campaign: any }>(`/campaigns/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteCampaign(id: string) {
        return this.request<{ message: string }>(`/campaigns/${id}`, {
            method: 'DELETE',
        });
    }

    async uploadRecipients(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const headers: HeadersInit = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseURL}/campaigns/upload-recipients`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        return data;
    }

    /**
     * Send campaign emails via backend (secure - no credentials exposed)
     */
    async sendCampaign(data: {
        credentialEmail: string;
        subject: string;
        body: string;
        recipients: Array<{
            email: string;
            fullName: string;
            companyName: string;
            jobTitle?: string;
        }>;
        batchSize?: number;
        batchDelay?: number;
    }) {
        return this.request<{
            message: string;
            results: Array<{ email: string; status: 'sent' | 'failed'; error?: string }>;
            summary: { total: number; sent: number; failed: number };
        }>('/campaigns/send', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch {
            // Ignore errors - still clear local token
        } finally {
            this.setToken(null);
            localStorage.removeItem('refreshToken');
        }
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const data = await this.request<{
            accessToken: string;
        }>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });

        this.setToken(data.accessToken);
        return data;
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
