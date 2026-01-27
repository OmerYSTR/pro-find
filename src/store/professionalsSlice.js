import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

export const fetchProfessionals=createAsyncThunk(
    'professionals/fetch'
)