import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Avatar,
  Grid,
  IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../utils/toast.jsx';
import { uploadProfileImage } from '../../utils/api';

const ProfileForm = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setBio(currentUser.bio || '');
      setProfilePicture(currentUser.profilePicture || '');
      
      if (currentUser.profilePicture) {
        setPreviewUrl(currentUser.profilePicture);
      }
    }
  }, [currentUser]);
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 1MB)
    if (file.size > 1024 * 1024) {
      setError('Image size must be less than 1MB');
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Only image files are allowed');
      return;
    }
    
    // Create preview URL for immediate display
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Upload the image to the server
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await uploadProfileImage(formData);
      
      if (response.success) {
        setProfilePicture(response.imageUrl);
        showToast('Profile picture uploaded successfully', 'success');
      } else {
        setError(response.message || 'Failed to upload image');
        // Reset preview if upload failed
        setPreviewUrl(currentUser?.profilePicture || '');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Please try again.');
      // Reset preview if upload failed
      setPreviewUrl(currentUser?.profilePicture || '');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (email && !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const userData = {
        email,
        bio,
        profilePicture
      };
      
      const result = await updateProfile(userData);
      
      if (result.success) {
        showToast('Profile updated successfully', 'success');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Edit Profile
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={previewUrl}
                alt={currentUser?.username}
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {currentUser?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <input
                accept="image/*"
                type="file"
                id="profile-picture-input"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />
              <label htmlFor="profile-picture-input">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper'
                  }}
                  disabled={uploadingImage}
                >
                  <PhotoCameraIcon />
                </IconButton>
              </label>
              {uploadingImage && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Uploading...
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={currentUser?.username || ''}
              disabled
              helperText="Username cannot be changed"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={email && !validateEmail(email)}
              helperText={email && !validateEmail(email) ? "Please enter a valid email" : ""}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Bio"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText={`${bio.length}/500 characters`}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading || uploadingImage}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ProfileForm; 