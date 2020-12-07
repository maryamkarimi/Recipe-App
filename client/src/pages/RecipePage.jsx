import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Col, Row, Input, Pagination, Button, Layout } from 'antd';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardHeader,
  CardMedia,
  Container,
} from '@material-ui/core';
import '../styles/RecipePage.less';

import { getRecipeByIngredientsService, getRecipeByBasicSearchService } from '../service/recipe/index';
import recipeData from '../data/dummyRecipes.json';

const { Header, Content } = Layout;

// Higher values -> less calls that can be made
const MAX_RESULTS = 24;
// I was going off of the figma diagram when choosing how many recipes to show
const PAGE_SIZE = 6;
const pageArray = (arr, pageNum, size) => {
  return arr.slice((pageNum - 1) * size, pageNum * size);
};

const recipeGrid = (recipeArr) => (
  <Grid
    container
    spacing={2}
    direction={'row'}
    justify={'flex-start'}
    alignItems={'flex-start'}>
    {recipeArr.map((recipe, index) => (
      <Grid item xs={12} md={6} key={index}>
        <Card>
          <CardMedia
            image={recipe.image}
            className={'recipe-card-img'}
            title={recipe.title}
          />
          <CardContent>
            <Typography variant={'h5'} component={'h2'}>
              {recipe.title}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const RecipePage = () => {
  const [recipes, setRecipes] = useState(recipeData.results);
  const [displayedRecipes, setDisplayedRecipes] = useState(pageArray(recipes, 1, PAGE_SIZE));
  const [rows, setRows] = useState(recipeGrid(displayedRecipes));

  const [searchTerms, setSearchTerms] = useState([]);
  const history = useHistory();
  const { location } = history;

  const updateRecipesToDisplays = (recipeArr, pageNumber = 1, pageSize = PAGE_SIZE) => {
    const nextRecipeArr = pageArray(recipeArr, pageNumber, pageSize);
    setDisplayedRecipes(nextRecipeArr);
    setRows(recipeGrid(nextRecipeArr));
  };

  useEffect(() => {
    if (location.state) {
      setSearchTerms(location.state.selectedIngredients);
      history.replace({
        state: null
      });
    }
  }, [history, location]);

  useEffect(() => {
    if (searchTerms.length > 0) {
      getRecipeByIngredientsService(searchTerms, MAX_RESULTS).then(response => {
        setRecipes(response);
        updateRecipesToDisplays(response);
      });
    }
  }, [searchTerms]);


  const search = (e) => {
    const searchTerm = e.target.value;
    e.target.value = '';

    // Calls the spoonacular API for a basic natural language search
    getRecipeByBasicSearchService(searchTerm, MAX_RESULTS).then(response => {
      setRecipes(response.results)
      updateRecipesToDisplays(response.results);
    });

  };

  return (
    <Layout className='search-by-recipe'>
      <Header className='header'>
        <a href='/' className='header-app-name'>
          App Name
        </a>
        <a href="/ingredient">Search By Ingredient</a>
      </Header>

      <Content className='content'>
        <Row>
          <Col span={4}>
          </Col>
        </Row>
        <Row align='middle' gutter={[32, 24]} justify='center'>
          <Col span={12}>
            {/* TODO - Wire search functionality to API */}
            <Input size='large' placeholder='Search for recipes' allowClear onPressEnter={search} />
          </Col>
        </Row>
        <Container maxWidth={'md'}>{rows}</Container>
        <Row align='middle' gutter={[32, 24]} justify='center'>
          <Col>
            <Pagination
              defaultCurrent={1}
              total={recipes.length}
              pageSize={PAGE_SIZE}
              onChange={
                (page, pageSize) => {
                  updateRecipesToDisplays(recipes, page, pageSize)
                }
              }
            />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RecipePage;
