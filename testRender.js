require('@babel/register')({
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
    ]
});
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');

const AuthContextMock = React.createContext({ user: { _id: '123' }, setUser: () => {} });

// We need to mock the context import in LabDashboard
const mockUser = { _id: '123', name: 'Test User' };

try {
    const LabDashboard = require('./frontend/src/pages/LabDashboard.jsx').default;
    const element = React.createElement(
        MemoryRouter,
        null,
        React.createElement(
            AuthContextMock.Provider,
            { value: { user: mockUser, setUser: () => {} } },
            React.createElement(LabDashboard)
        )
    );
    const html = ReactDOMServer.renderToString(element);
    console.log("Render successful. Length:", html.length);
} catch (e) {
    console.error("Render failed with error:", e.message);
    console.error(e.stack);
}
