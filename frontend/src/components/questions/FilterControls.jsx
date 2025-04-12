import { useState } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  InputAdornment,
  Chip,
  Stack,
  Typography,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useSearchParams } from 'react-router-dom';

const FilterControls = ({ onFilter, popularTags = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    applyFilters({ sortBy: event.target.value });
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
    applyFilters({ sortOrder: event.target.value });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    applyFilters({ search: searchTerm });
  };

  const handleTagClick = (tag) => {
    const newTag = selectedTag === tag ? '' : tag;
    setSelectedTag(newTag);
    applyFilters({ tag: newTag });
  };

  const applyFilters = (newFilters) => {
    const filters = {
      sortBy,
      sortOrder,
      tag: selectedTag,
      search: searchTerm,
      ...newFilters
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    // Update URL search params
    setSearchParams(filters);

    // Call parent callback
    if (onFilter) {
      onFilter(filters);
    }
  };

  return (
    <Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        {/* Search Bar */}
        <Box sx={{ flexGrow: 1 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search questions..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>

        {/* Sort Controls */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1}
          sx={{ minWidth: { sm: '300px' } }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={sortBy}
              label="Sort By"
              onChange={handleSortByChange}
            >
              <MenuItem value="createdAt">Date</MenuItem>
              <MenuItem value="netVotes">Votes</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-order-label">Order</InputLabel>
            <Select
              labelId="sort-order-label"
              id="sort-order"
              value={sortOrder}
              label="Order"
              onChange={handleSortOrderChange}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Tags Section */}
      {popularTags.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary'
              }}
            >
              <TuneIcon fontSize="small" sx={{ mr: 1 }} />
              Popular Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {popularTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  clickable
                  color={selectedTag === tag ? 'primary' : 'default'}
                  variant={selectedTag === tag ? 'filled' : 'outlined'}
                  onClick={() => handleTagClick(tag)}
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};

export default FilterControls; 