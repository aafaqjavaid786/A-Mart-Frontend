import React, {useState, useEffect} from 'react'
import { Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { listProducts } from '../actions/productActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Product from '../components/Product'
import Paginate from '../components/Paginate'
import ProductCarousel from '../components/ProductCarousel'
import axios from 'axios'

function HomeScreen() {
  // const [products, setProducts] = useState([])

  const dispatch = useDispatch()
  const productList = useSelector(state => state.productList)
  const {error, loading, products, page, pages} = productList

  const location = useLocation()
  let keyword = location.search

  // console.log(keyword)

  useEffect(() => {
    dispatch(listProducts(keyword))

    // async function fetchProducts(){
    //   const {data} = await axios.get('http://127.0.0.1:8000/api/products/')
    //   setProducts(data)
    // }

    // fetchProducts()
  }, [dispatch, keyword])
  return (
    <div>
      {!keyword && <ProductCarousel />}
      <h1>Latest Products</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div>
          <Row>
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate page={page} pages={pages} keyword={keyword} />
        </div>
      )}
    </div>
  );
}

export default HomeScreen