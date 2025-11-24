import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import LoginForm from '../../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={4}>
                    <Card>
                        <Card.Body>
                            <LoginForm />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;