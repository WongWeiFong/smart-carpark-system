import React from 'react';

class KonvaErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Konva Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when Konva fails
      return (
        <div className="konva-error-fallback">
          <div className="error-container">
            <h3>🚗 Parking Layout Unavailable</h3>
            <p>The interactive parking layout couldn't load. This might be due to:</p>
            <ul>
              <li>Missing Konva.js dependencies</li>
              <li>Browser compatibility issues</li>
              <li>Canvas rendering problems</li>
            </ul>
            <div className="fallback-actions">
              <button 
                onClick={() => this.setState({ hasError: false })}
                className="retry-btn"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="reload-btn"
              >
                Reload Page
              </button>
            </div>
            {this.props.showOldVersion && (
              <div className="fallback-option">
                <p>You can use the basic parking layout instead:</p>
                <button 
                  onClick={this.props.onFallbackClick}
                  className="fallback-btn"
                >
                  Use Basic Layout
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default KonvaErrorBoundary; 