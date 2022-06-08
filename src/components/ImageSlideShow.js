import Carousel from 'react-bootstrap/Carousel';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ImageSlideShow = ({ posts }) => {
  const imageList = posts.filter(post => post.data.image);
  return (
    <Carousel>
      {imageList.map((image) =>
        <Carousel.Item key = {image.id}>
          <Link to={`/postDetail/${image.id}`}>
            <img
              className="d-block w-100"
              src={image.data.image}
              alt={image.data.title}
            />
            <Carousel.Caption>
              <h3>{image.data.title}</h3>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      )}
    </Carousel>
  )
}

ImageSlideShow.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default ImageSlideShow
