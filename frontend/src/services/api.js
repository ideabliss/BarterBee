const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    // Log outgoing request
    console.log('🚀 API Request:', {
      method: config.method || 'GET',
      url,
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : null
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Log incoming response
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url,
        data
      });

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          url,
          error: data.error || 'Something went wrong'
        });
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('💥 API Request Failed:', {
        url,
        error: error.message
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Skills endpoints
  async getSkills(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/skills${query ? `?${query}` : ''}`);
  }

  async getUserSkills() {
    return this.request('/skills/my-skills');
  }

  async createSkill(skillData) {
    return this.request('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async updateSkill(id, skillData) {
    return this.request(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData),
    });
  }

  async deleteSkill(id) {
    return this.request(`/skills/${id}`, {
      method: 'DELETE',
    });
  }

  // Items endpoints
  async getItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/items${query ? `?${query}` : ''}`);
  }

  async getUserItems() {
    return this.request('/items/my-items');
  }

  async createItem(itemData) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id, itemData) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Polls endpoints
  async getPolls() {
    return this.request('/polls');
  }

  async getUserPolls() {
    return this.request('/polls/my-polls');
  }

  async createPoll(pollData) {
    return this.request('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  }

  async voteOnPoll(pollId, optionIndex) {
    return this.request(`/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_index: optionIndex }),
    });
  }

  // Barter requests endpoints
  async createBarterRequest(requestData) {
    return this.request('/barter', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getBarterRequests() {
    return this.request('/barter/requests');
  }

  async updateBarterStatus(id, status) {
    return this.request(`/barter/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getActivity() {
    return this.request('/barter/activity');
  }

  // Sessions endpoints
  async createSession(sessionData) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getUserSessions() {
    return this.request('/sessions/my-sessions');
  }

  async updateSession(id, sessionData) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async updateSessionStatus(id, status) {
    return this.request(`/sessions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async rescheduleSession(id, sessionData) {
    return this.request(`/sessions/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  async joinSession(id) {
    return this.request(`/sessions/${id}/join`, {
      method: 'POST',
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread/count');
  }

  // Messages endpoints
  async getMessages(barterRequestId) {
    return this.request(`/messages/${barterRequestId}`);
  }

  async sendMessage(messageData) {
    const payload = {
      barter_request_id: messageData.barter_request_id,
      message_text: messageData.message,
      receiver_id: messageData.receiver_id
    };
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Reviews endpoints
  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async submitSessionReview(reviewData) {
    return this.request('/reviews/session', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getUserReviews(userId) {
    return this.request(`/reviews/user/${userId}`);
  }

  // Tracking endpoints
  async createTracking(trackingData) {
    return this.request('/tracking', {
      method: 'POST',
      body: JSON.stringify(trackingData),
    });
  }

  async getTracking(barterRequestId) {
    return this.request(`/tracking/${barterRequestId}`);
  }

  async updateTrackingStatus(id, statusData) {
    return this.request(`/tracking/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getDashboardActivity() {
    return this.request('/dashboard/activity');
  }

  // Schedule session
  async scheduleSession(sessionData) {
    return this.request('/sessions/schedule', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Reschedule session
  async rescheduleSession(sessionId, sessionData) {
    return this.request(`/sessions/${sessionId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Password reset endpoints
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Session history endpoints
  async getSessionHistory(barterRequestId) {
    return this.request(`/sessions/history/${barterRequestId}`);
  }

  async completeSession(sessionId) {
    return this.request(`/sessions/${sessionId}/complete`, {
      method: 'PUT',
    });
  }
}

export default new ApiService();