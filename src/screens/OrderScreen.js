import React, {useState, useEffect} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { PayPalButton } from 'react-paypal-button-v2'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'

function OrderScreen() {
    const {id} = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [sdkReady, setSdkReady] = useState(false)
    
    const orderDetails = useSelector(state => state.orderDetails)
    const {error, order, loading} = orderDetails

    const orderPay = useSelector(state => state.orderPay)
    const {loading: loadingPay, success: successPay} = orderPay

    const orderDeliver = useSelector(state => state.orderDeliver)
    const {loading: loadingDeliver, success: successDeliver} = orderDeliver

    const userLogin = useSelector(state => state.userLogin)
    const {userInfo} = userLogin

    if(!loading && !error){
        order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    }

    const addPayPalScript = () =>{
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = 'https://www.paypal.com/sdk/js?client-id=Ae2eMGM63yzd9eI5htaLGHTwh6yeZVrijPadorLq2CJGKuKMn68FdjCMfBT87UVkeKNVxcbRC81ml_4j&currency=USD'
        script.async = true
        script.onload = () =>{
            setSdkReady(true)
        }
        document.body.appendChild(script)
    }

    useEffect(() => {
        if(!userInfo){
            navigate('/login')
        }

        if(!order || successPay || order._id !== Number(id) || successDeliver){
            dispatch({type: ORDER_PAY_RESET})
            dispatch({type: ORDER_DELIVER_RESET})
            dispatch(getOrderDetails(id))
        }else if(!order.isPaid){
            if(!window.paypal){
                addPayPalScript();   
            }
            else{
                setSdkReady(true)
            }
        }
    }, [dispatch, order, id, successPay, successDeliver])

    const successPaymentHandler = (paymentResult) =>{
        dispatch(payOrder(id, paymentResult))
    }

    const deliverHandler = () =>{
        dispatch(deliverOrder(order))
    }

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <div>
        <h2>Order: {order._id}</h2>
      <Row>
        <Col md={8}>
            <ListGroup variant='flush'>
                <ListGroup.Item>
                    <h2>Shipping</h2>
                    <p>
                        <strong>
                            Name:   
                        </strong>
                         {order.user.name}
                    </p>
                    <p>
                        <strong>
                            Email: 
                        </strong>
                        <a href={`mailto:${order.user.email}`}> {order.user.email}</a>
                    </p>
                    <p>
                        <strong>Shipping: </strong>
                        {order.shippingAddress.address},
                        {' '}
                        {order.shippingAddress.city},
                        {' '}
                        {order.shippingAddress.country},
                        {' '}
                        {order.shippingAddress.postalCode}
                    </p>
                    <p>
                        {order.isDelivered ? 
                        <Message variant='success'>Delivered on {order.deliveredAt}</Message>
                        : <Message variant='warning'>Not Delivered</Message>}
                    </p>
                </ListGroup.Item>
                <ListGroup.Item>
                    <h2>Payment Method</h2>
                    <p>
                        <strong>Method: </strong>
                        {order.paymentMethod}
                    </p>
                    <p>
                        {order.isPaid ? 
                        <Message variant='success'>Paid on {order.paidAt}</Message>
                        : <Message variant='warning'>Not Paid</Message>}
                    </p>
                </ListGroup.Item>
                <ListGroup.Item>
                    <h2>Order Items</h2>
                    {order.orderItems.length === 0 ? (
                        <Message>
                            Order is empty
                        </Message>
                    ): (
                        <ListGroup variant='flush'>
                            {order.orderItems.map((item, index) => (
                                <ListGroup.Item key={index}>
                                    <Row>
                                        <Col md={1}>
                                            <Image src={item.image} alt={item.name} fluid rounded/>
                                        </Col>
                                        <Col>
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </Col>
                                        <Col>
                                            {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </ListGroup.Item>
            </ListGroup>
        </Col>
        <Col md={4}>
            <Card>
                <ListGroup variant='flush'>
                    <h2>Order Summary</h2>
                    <ListGroup.Item>
                        <Row>
                            <Col>Items: </Col>
                            <Col>${order.itemsPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Shipping: </Col>
                            <Col>${order.shippingPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Tax: </Col>
                            <Col>${order.taxPrice}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Total: </Col>
                            <Col>${order.totalPrice}</Col>
                        </Row>
                    </ListGroup.Item>

                    {!order.isPaid && (
                        <ListGroup.Item>
                            {loadingPay && <Loader />}
                            {!sdkReady ?
                            <Loader /> : (
                                <PayPalButton 
                                amount={order.totalPrice}
                                onSuccess={successPaymentHandler}
                                />
                            )}
                        </ListGroup.Item>
                    )}

                    {loadingDeliver && <Loader />}

                    {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                        <ListGroup.Item className="d-flex justify-content-center">
                            <Button
                            type='button'
                            className="btn-block w-100"
                            onClick={deliverHandler}>
                                Mark as Delivered
                            </Button>
                        </ListGroup.Item>
                    )}

                </ListGroup>
            </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OrderScreen