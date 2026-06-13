// API Configuration - Update this URL when deploying
const API_BASE = 'https://streamplaydrama-backend.onrender.com';
const API_URL = `${API_BASE}/api/blogs`;
const UPLOAD_URL = `${API_BASE}/api/upload`;

let sectionCount = 0;
const tags = [];

// Image upload functionality
document.getElementById('imageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('uploadBtn').disabled = false;
        document.getElementById('uploadStatus').textContent = `Selected: ${file.name}`;
        document.getElementById('uploadStatus').style.color = '#F59E0B';
    } else {
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('uploadStatus').textContent = '';
    }
});

async function uploadImage() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select an image first');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Show uploading status
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    uploadBtn.disabled = true;
    uploadBtn.textContent = '⏳ Uploading...';
    uploadStatus.textContent = 'Uploading...';
    uploadStatus.style.color = '#F59E0B';

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Set the image URL in the input field
            document.getElementById('featuredImage').value = result.data.url;
            
            // Show preview with full backend URL
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = API_BASE + result.data.url;
            preview.style.display = 'block';
            
            // Update status
            uploadStatus.textContent = '✅ Uploaded successfully!';
            uploadStatus.style.color = '#10B981';
            uploadBtn.textContent = '✅ Uploaded';
            
            // Reset after 3 seconds
            setTimeout(() => {
                uploadBtn.textContent = '⬆️ Upload';
                uploadStatus.textContent = result.data.filename;
            }, 3000);
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = '❌ Upload failed';
        uploadStatus.style.color = '#DC2626';
        uploadBtn.textContent = '⬆️ Upload';
        uploadBtn.disabled = false;
        alert('Failed to upload image: ' + error.message);
    }
}

// Character counters
document.getElementById('title').addEventListener('input', (e) => {
    document.getElementById('titleCount').textContent = e.target.value.length;
});

document.getElementById('excerpt').addEventListener('input', (e) => {
    document.getElementById('excerptCount').textContent = e.target.value.length;
});

document.getElementById('metaDescription').addEventListener('input', (e) => {
    document.getElementById('metaCount').textContent = e.target.value.length;
});

// Tags functionality
document.getElementById('tagInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const value = e.target.value.trim();
        if (value && !tags.includes(value)) {
            tags.push(value);
            renderTags();
            e.target.value = '';
        }
    }
});

function renderTags() {
    const container = document.getElementById('tagsContainer');
    const input = document.getElementById('tagInput');
    container.innerHTML = '';
    
    tags.forEach((tag, index) => {
        const tagEl = document.createElement('div');
        tagEl.className = 'tag';
        tagEl.innerHTML = `
            ${tag}
            <button type="button" class="tag-remove" onclick="removeTag(${index})">×</button>
        `;
        container.appendChild(tagEl);
    });
    
    container.appendChild(input);
}

function removeTag(index) {
    tags.splice(index, 1);
    renderTags();
}

// Add initial section on page load
document.addEventListener('DOMContentLoaded', function() {
    addSection();
});

function addSection() {
    sectionCount++;
    const container = document.getElementById('sectionsContainer');
    const section = document.createElement('div');
    section.className = 'section-item';
    section.id = `section-${sectionCount}`;
    section.innerHTML = `
        <div class="section-header">
            <span class="section-number">Section ${sectionCount}</span>
            ${sectionCount > 1 ? `<button type="button" class="remove-section" onclick="removeSection(${sectionCount})">Remove</button>` : ''}
        </div>
        <div class="form-group">
            <label>Section Title <span class="required">*</span></label>
            <input type="text" class="section-title" required placeholder="e.g., Introduction">
        </div>
        <div class="form-group">
            <label>Section Content <span class="required">*</span></label>
            <textarea class="section-content" required rows="6" placeholder="Write your section content here..."></textarea>
        </div>
    `;
    container.appendChild(section);
}

function removeSection(id) {
    document.getElementById(`section-${id}`).remove();
}

// Form submission
document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const sections = [];
    document.querySelectorAll('.section-item').forEach(item => {
        sections.push({
            sectionTitle: item.querySelector('.section-title').value,
            sectionContent: item.querySelector('.section-content').value
        });
    });

    const blogData = {
        title: document.getElementById('title').value,
        excerpt: document.getElementById('excerpt').value,
        category: document.getElementById('category').value,
        featuredImage: document.getElementById('featuredImage').value,
        metaDescription: document.getElementById('metaDescription').value || undefined,
        content: sections,
        tags: tags
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
            document.getElementById('blogForm').reset();
            tags.length = 0;
            renderTags();
            
            // Reset image upload
            document.getElementById('uploadBtn').disabled = true;
            document.getElementById('uploadStatus').textContent = '';
            document.getElementById('imagePreview').style.display = 'none';
            
            // Reset sections
            document.getElementById('sectionsContainer').innerHTML = '';
            sectionCount = 0;
            addSection();
            
            window.scrollTo(0, 0);
        } else {
            throw new Error(result.message || 'Failed to create blog');
        }
    } catch (error) {
        document.getElementById('errorMessage').textContent = '❌ Error: ' + error.message;
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        window.scrollTo(0, 0);
    }
});

function previewBlog() {
    alert('Preview functionality coming soon! For now, submit the blog and view it on the frontend.');
}
