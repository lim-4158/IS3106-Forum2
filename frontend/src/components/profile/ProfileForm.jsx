import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Grid,
  IconButton,
  Card,
  Divider,
  InputAdornment
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';
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
    <>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Card 
        variant="outlined" 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: 3, 
          backgroundColor: 'primary.main', 
          color: 'primary.contrastText' 
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Profile Information
          </Typography>
        </Box>
        
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Top section with profile picture, username, email */}
            <Grid container spacing={4} sx={{ mb: 2 }}>
              {/* Profile picture on the left */}
              <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Avatar
                    src={previewUrl}
                    alt={currentUser?.username}
                    sx={{ 
                      width: { xs: 120, sm: 140 }, 
                      height: { xs: 120, sm: 140 },
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
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
                        backgroundColor: 'white',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        '&:hover': {
                          backgroundColor: 'white',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }
                      }}
                      disabled={uploadingImage}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                </Box>
                
                {uploadingImage && (
                  <Typography variant="caption" color="text.secondary">
                    Uploading...
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Click the camera icon to change your profile picture
                </Typography>
              </Grid>
              
              {/* Username and email on the right */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                      Username
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={currentUser?.username || ''}
                      disabled
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircleIcon color="disabled" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Username cannot be changed"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                      Email
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={email && !validateEmail(email)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      helperText={email && !validateEmail(email) ? "Please enter a valid email" : ""}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Bio taking full width below */}
            <Box sx={{ width: '100%', mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary' }}>
                Bio
              </Typography>
              <TextField
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                inputProps={{ maxLength: 500 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
              <Typography variant="caption" color="text.secondary" align="right" sx={{ display: 'block', mt: 0.5 }}>
                {bio.length}/500 characters
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading || uploadingImage}
                size="large"
                sx={{
                  borderRadius: 1,
                  px: 4,
                  backgroundColor: '#0a4d8f',
                  '&:hover': {
                    backgroundColor: '#083b6f'
                  }
                }}
              >
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </Box>
          </form>
        </Box>
      </Card>
    </>
  );
};

export default ProfileForm; 