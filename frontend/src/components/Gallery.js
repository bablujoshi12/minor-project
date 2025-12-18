import React, { useState } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Gallery photos - Using multiple reliable image sources for college/campus photos
  // Using Pexels and Pixabay free images with college/campus themes
  const galleryImages = [
    {
      id: 1,
      src: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'GPL Lohaghat Campus View',
      category: 'Campus',
      title: 'Main Campus Building - Government Polytechnic Lohaghat'
    },
    {
      id: 2,
      src: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Cultural Event at GPL',
      category: 'Events',
      title: 'Cultural Event 2024 - संस्था स्तरीय कार्यक्रम'
    },
    {
      id: 3,
      src: 'https://images.pexels.com/photos/863926/pexels-photo-863926.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Sports Competition',
      category: 'Sports',
      title: 'संस्था स्तरीय क्रीड़ा प्रतियोगिता 2024'
    },
    {
      id: 4,
      src: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Laboratory Facilities',
      category: 'Facilities',
      title: 'Electronics Engineering Laboratory'
    },
    {
      id: 5,
      src: 'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Library',
      category: 'Facilities',
      title: 'Central Library - Extensive Collection'
    },
    {
      id: 6,
      src: 'https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Classroom',
      category: 'Academics',
      title: 'Modern Classroom - Interactive Learning'
    },
    {
      id: 7,
      src: 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Workshop',
      category: 'Facilities',
      title: 'Engineering Workshop - Hands-on Training'
    },
    {
      id: 8,
      src: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Placement Drive',
      category: 'Events',
      title: 'Placement Drive - Industry Opportunities'
    },
    {
      id: 9,
      src: 'https://images.pexels.com/photos/159775/library-adult-reading-students-159775.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Graduation Ceremony',
      category: 'Events',
      title: 'Annual Convocation - Graduation Day'
    },
    {
      id: 10,
      src: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Aerial View of Campus',
      category: 'Campus',
      title: 'Aerial Campus View - Government Polytechnic'
    },
    {
      id: 11,
      src: 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'NCC/NSS Activity',
      category: 'Activities',
      title: 'NCC/NSS Services - Social Activities'
    },
    {
      id: 12,
      src: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Student Activity',
      category: 'Activities',
      title: 'Student Activities - Extra Curricular'
    },
    {
      id: 13,
      src: 'https://images.pexels.com/photos/1181376/pexels-photo-1181376.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Computer Science Lab',
      category: 'Facilities',
      title: 'Computer Science Laboratory - IT Department'
    },
    {
      id: 14,
      src: 'https://images.pexels.com/photos/4491461/pexels-photo-4491461.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Civil Engineering Lab',
      category: 'Facilities',
      title: 'Civil Engineering Laboratory'
    },
    {
      id: 15,
      src: 'https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Pharmacy Lab',
      category: 'Facilities',
      title: 'Pharmacy Laboratory - D.Pharm Program'
    },
    {
      id: 16,
      src: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      alt: 'Group Study',
      category: 'Academics',
      title: 'Group Study Session - Student Collaboration'
    }
  ];

  const categories = ['All', 'Campus', 'Events', 'Sports', 'Facilities', 'Academics', 'Activities'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredImages = activeCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <div className="gallery-page">
      {/* Gallery Header */}
      <section className="gallery-hero">
        <div className="gallery-hero-content">
          <h1>📸 Photo Gallery</h1>
          <p>राजकीय पॉलीटेक्निक लोहाघाट - Moments & Memories</p>
          <p className="gallery-subtitle">Explore our campus, events, facilities, and student life</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="gallery-filters">
        <div className="filter-container">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="gallery-grid-section">
        <div className="gallery-grid">
          {filteredImages.map(image => (
            <div
              key={image.id}
              className="gallery-item"
              onClick={() => openLightbox(image)}
            >
              <div className="gallery-item-overlay">
                <span className="gallery-item-category">{image.category}</span>
                <h3 className="gallery-item-title">{image.title}</h3>
                <div className="gallery-item-icon">🔍</div>
              </div>
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  e.target.classList.add('loaded');
                }}
                onError={(e) => {
                  // Primary fallback - Picsum random image
                  if (!e.target.dataset.fallbackUsed) {
                    e.target.dataset.fallbackUsed = 'true';
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/400/300?random=${image.id}`;
                    e.target.onerror = function() {
                      // Final fallback - SVG placeholder
                      this.onerror = null;
                      this.classList.add('loaded');
                      this.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%231e3a8a" width="400" height="300"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="16" font-family="Arial">${encodeURIComponent(image.title.substring(0, 25))}</text></svg>`;
                    };
                  } else {
                    e.target.classList.add('loaded');
                  }
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            <button className="lightbox-nav lightbox-prev" onClick={() => navigateImage('prev')}>‹</button>
            <button className="lightbox-nav lightbox-next" onClick={() => navigateImage('next')}>›</button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="lightbox-image"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (!e.target.dataset.fallbackUsed) {
                  e.target.dataset.fallbackUsed = 'true';
                  e.target.onerror = null;
                  e.target.src = `https://picsum.photos/800/600?random=${selectedImage.id}`;
                  e.target.onerror = function() {
                    this.onerror = null;
                    this.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="%231e3a8a" width="800" height="600"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="white" font-size="20" font-family="Arial">${encodeURIComponent(selectedImage.title.substring(0, 40))}</text></svg>`;
                  };
                }
              }}
            />
            <div className="lightbox-info">
              <h3>{selectedImage.title}</h3>
              <span className="lightbox-category">{selectedImage.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

