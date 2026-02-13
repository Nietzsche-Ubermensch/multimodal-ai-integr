# Python Platform Reference

## Detection

**Files:** `pyproject.toml`, `requirements.txt`, `setup.py`, `*.py`

## Common Patterns

### Web Frameworks
- Django
- Flask
- FastAPI
- Pyramid

**Indicators:**
- `django`, `flask`, `fastapi` imports
- `views.py`, `models.py`
- Route decorators
- Settings/config modules

### Data Science
- NumPy
- Pandas
- Scikit-learn
- TensorFlow/PyTorch

**Indicators:**
- `import numpy`, `import pandas`
- Jupyter notebooks (`.ipynb`)
- Data processing pipelines

### Testing
- pytest
- unittest
- doctest

**Indicators:**
- `test_*.py` or `*_test.py`
- `conftest.py`
- `@pytest` decorators

## Source Locations

**Django structure:**
```
project/
├── app/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
└── manage.py
```

**Generic structure:**
```
src/
├── models/
├── services/
├── utils/
└── tests/
```

## Architectural Patterns

### Code Conventions
- snake_case for functions/variables
- PascalCase for classes
- Private members prefixed with `_`
- Docstrings (Google/NumPy/reStructuredText style)

### Python-Specific
- Context managers
- Decorators
- Generators
- Type hints (3.5+)

## Skill Discovery Hints

Look for:
- Class-based views
- Django models
- API endpoints
- Data models
- Utility functions
- Decorators
- Context managers
