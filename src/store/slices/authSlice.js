import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const registerPartner = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
}
);

export const loginPartner = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
}
);

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Failed to fetch profile',
      status: error.response?.status,
    });
  }
}
);

export const addfooditem = createAsyncThunk('auth/addfooditem', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/foods', data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add food item');
  }
}
);

export const getFoodItems = createAsyncThunk('auth/getFoodItems', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/foods');
    return Array.isArray(response.data) ? response.data : (response.data?.data || []);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch food items');
  }
}
);

export const updateFoodItem = createAsyncThunk('auth/updateFoodItem', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/foods/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update food item');
  }
}
);

export const deleteFoodItem = createAsyncThunk('auth/deleteFoodItem', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/foods/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete food item');
  }
}
);



const initialState = {
  token: localStorage.getItem('token') || null,
  user: null,
  profiles: [],
  foods: [],
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.profiles = [];
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    addProfile: (state, action) => {
      const newProfile = {
        _id: 'rest_' + Date.now(),
        ...action.payload
      };
      if (!state.profiles) state.profiles = [];
      state.profiles.push(newProfile);
      state.user = newProfile;
    },
    updateProfile: (state, action) => {
      const updatedData = action.payload;
      if (!state.profiles) state.profiles = [];
      state.profiles = state.profiles.map(p => p._id === updatedData._id ? { ...p, ...updatedData } : p);
      if (state.user && state.user._id === updatedData._id) {
        state.user = { ...state.user, ...updatedData };
      }
    },
    deleteProfile: (state, action) => {
      const id = action.payload;
      if (!state.profiles) state.profiles = [];
      state.profiles = state.profiles.filter(p => p._id !== id);
      if (state.user && state.user._id === id) {
        state.user = state.profiles[0] || null;
      }
    },
    selectActiveProfile: (state, action) => {
      const id = action.payload;
      if (!state.profiles) state.profiles = [];
      const found = state.profiles.find(p => p._id === id);
      if (found) {
        state.user = found;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && state.user._id === action.payload._id) {
          state.user = { ...action.payload, ...state.user };
        } else {
          state.user = action.payload;
        }
        if (action.payload && (!state.profiles || state.profiles.length === 0)) {
          state.profiles = [state.user];
        }
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 401) {
          state.token = null;
          state.isAuthenticated = false;
          state.user = null;
          localStorage.removeItem('token');
        }
      })
      .addCase(getFoodItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFoodItems.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload;
      })
      .addCase(getFoodItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addfooditem.fulfilled, (state, action) => {
        if (action.payload) {
          state.foods.push(action.payload);
        }
      })
      .addCase(updateFoodItem.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          state.foods = state.foods.map(item => (item._id === updated._id || item.id === updated.id) ? updated : item);
        }
      })
      .addCase(deleteFoodItem.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.foods = state.foods.filter(item => item._id !== deletedId && item.id !== deletedId);
      });
  },
});

export const {logout,clearError,addProfile,updateProfile,deleteProfile,selectActiveProfile} = authSlice.actions;
export default authSlice.reducer;
