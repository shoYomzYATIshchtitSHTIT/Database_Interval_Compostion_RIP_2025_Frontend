import { Container, Carousel } from 'react-bootstrap'
import './HomePage.css'

const HomePage = () => {
    return (
        <Container>

            <Carousel className="home-carousel" fade interval={5000}>

                <Carousel.Item>
                    <div className="carousel-img-wrapper">
                        <img
                            className="d-block w-100 carousel-img"
                            src="/img/carousel/intervals1.png"
                            alt="Музыкальные интервалы"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Изучайте музыкальные интервалы</h3>
                        <p>От примы до октавы — фундамент музыкальной теории.</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="carousel-img-wrapper">
                        <img
                            className="d-block w-100 carousel-img"
                            src="/img/carousel/intervals2.png"
                            alt="Описание интервалов"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Подробные описания</h3>
                        <p>Узнайте, как звучит каждый интервал и где он применяется.</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <div className="carousel-img-wrapper">
                        <img
                            className="d-block w-100 carousel-img"
                            src="/img/carousel/intervals3.png"
                            alt="Тоновая структура"
                        />
                    </div>
                    <Carousel.Caption>
                        <h3>Тоновая структура</h3>
                        <p>Поймите точное соотношение тонов и полутонов.</p>
                    </Carousel.Caption>
                </Carousel.Item>

            </Carousel>

        </Container>
    )
}

export default HomePage
