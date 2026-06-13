// API Configuration - Update this URL when deploying
const API_BASE = 'https://streamplaydrama-backend.onrender.com';
const API_URL = `${API_BASE}/api/blogs`;

let currentPage = 1;
let totalPages = 1;
let currentCategory = 'all';
let searchQuery = '';
let allBlogs = [];
let blogToDelete = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBlogs();
    setupFilters();
});

// Setup filters
function setupFilters() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        filterBlogs();
    });

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        loadBlogs();
    });
}

// Load all blogs
async function loadBlogs() {
    const container = document.getElementById('blogsContainer');
    container.innerHTML = '<div class="loading">Loading blogs...</div>';

    try {
        const categoryParam = currentCategory !== 'all' ? `&category=${encodeURIComponent(currentCategory)}` : '';
        const response = await fetch(`${API_URL}?page=${currentPage}&limit=10${categoryParam}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            allBlogs = data.data;
            totalPages = data.totalPages;
            renderBlogs(data.data);
            renderPagination();
        } else {
            container.innerHTML = `
                <div class="no-blogs">
                    <div class="no-blogs-icon">📭</div>
                    <h3>No blogs found</h3>
                    <p>Start by creating your first blog post!</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 15px;">➕ Create Blog</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        container.innerHTML = '<div class="loading">Failed to load blogs. Please try again.</div>';
    }
}

// Filter blogs locally
function filterBlogs() {
    if (!searchQuery) {
        renderBlogs(allBlogs);
        return;
    }

    const filtered = allBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery) ||
        blog.excerpt.toLowerCase().includes(searchQuery) ||
        blog.category.toLowerCase().includes(searchQuery)
    );

    renderBlogs(filtered);
}

// Render blogs
function renderBlogs(blogs) {
    const container = document.getElementById('blogsContainer');
    
    if (blogs.length === 0) {
        container.innerHTML = `
            <div class="no-blogs">
                <div class="no-blogs-icon">🔍</div>
                <h3>No matching blogs found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    const html = blogs.map(blog => {
        const date = new Date(blog.publishDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const imageUrl = blog.featuredImage.startsWith('/api/image/') 
            ? API_BASE + blog.featuredImage 
            : blog.featuredImage;

        return `
            <div class="blog-card-manage">
                <img src="${imageUrl}" alt="${blog.title}" class="blog-image-thumb" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22100%22%3E%3Crect fill=%22%23374151%22 width=%22150%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23DC2626%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="blog-info">
                    <h3 class="blog-title">${blog.title}</h3>
                    <div class="blog-meta">
                        <span class="blog-category">${blog.category}</span>
                        <span>📅 ${date}</span>
                        <span>👁️ ${blog.views} views</span>
                    </div>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                </div>
                <div class="blog-actions">
                    <button class="btn-icon btn-edit" onclick="editBlog('${blog._id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteBlog('${blog._id}', '${blog.title.replace(/'/g, "\\'")}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Render pagination
function renderPagination() {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const html = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
            ← Previous
        </button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;

    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadBlogs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Edit blog
async function editBlog(blogId) {
    try {
        const url = `${API_URL}/id/${blogId}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.data) {
            const blog = data.data;
            
            document.getElementById('editBlogId').value = blog._id;
            document.getElementById('editTitle').value = blog.title;
            document.getElementById('editExcerpt').value = blog.excerpt;
            document.getElementById('editCategory').value = blog.category;
            document.getElementById('editFeaturedImage').value = blog.featuredImage;
            document.getElementById('editMetaDescription').value = blog.metaDescription || '';

            document.getElementById('editTitleCount').textContent = blog.title.length;
            document.getElementById('editExcerptCount').textContent = blog.excerpt.length;
            document.getElementById('editMetaCount').textContent = (blog.metaDescription || '').length;

            document.getElementById('editModal').style.display = 'block';
            setupEditCharCounters();
        } else {
            showError('Failed to load blog: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error fetching blog:', error);
        showError('Failed to load blog details: ' + error.message);
    }
}

// Setup character counters for edit form
function setupEditCharCounters() {
    document.getElementById('editTitle').addEventListener('input', (e) => {
        document.getElementById('editTitleCount').textContent = e.target.value.length;
    });

    document.getElementById('editExcerpt').addEventListener('input', (e) => {
        document.getElementById('editExcerptCount').textContent = e.target.value.length;
    });

    document.getElementById('editMetaDescription').addEventListener('input', (e) => {
        document.getElementById('editMetaCount').textContent = e.target.value.length;
    });
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Handle edit form submission
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const blogId = document.getElementById('editBlogId').value;
    const blogData = {
        title: document.getElementById('editTitle').value,
        excerpt: document.getElementById('editExcerpt').value,
        category: document.getElementById('editCategory').value,
        metaDescription: document.getElementById('editMetaDescription').value || undefined
    };

    try {
        const response = await fetch(`${API_URL}/${blogId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('Blog updated successfully!');
            closeEditModal();
            loadBlogs();
        } else {
            throw new Error(result.message || 'Failed to update blog');
        }
    } catch (error) {
        console.error('Error updating blog:', error);
        showError('Failed to update blog: ' + error.message);
    }
});

// Delete blog (show confirmation)
function deleteBlog(blogId, blogTitle) {
    blogToDelete = blogId;
    document.getElementById('deleteBlogTitle').textContent = blogTitle;
    document.getElementById('deleteModal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    blogToDelete = null;
}

// Confirm delete
async function confirmDelete() {
    if (!blogToDelete) return;

    try {
        const response = await fetch(`${API_URL}/${blogToDelete}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('Blog deleted successfully!');
            closeDeleteModal();
            loadBlogs();
        } else {
            throw new Error(result.message || 'Failed to delete blog');
        }
    } catch (error) {
        console.error('Error deleting blog:', error);
        showError('Failed to delete blog: ' + error.message);
    }
}

// Show success message
function showSuccess(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = '✅ ' + message;
    successMsg.style.display = 'block';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 5000);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show error message
function showError(message) {
    const errorMsg = document.getElementById('errorMessage');
    errorMsg.textContent = '❌ ' + message;
    errorMsg.style.display = 'block';
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.target == editModal) {
        closeEditModal();
    }
    if (event.target == deleteModal) {
        closeDeleteModal();
    }
}
