const express = require('express');
const multer = require('multer');
const { supabase } = require('../config/supabase');
const authenticateToken = require('../Auth/middleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

router.post('/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const fileName = `poll-images/${Date.now()}-${req.file.originalname}`;
    
    const { data, error } = await supabase.storage
      .from('image')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('image')
      .getPublicUrl(fileName);

    res.json({ imageUrl: publicUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;