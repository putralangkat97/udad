<?php

test('registration routes are unavailable', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register')->assertNotFound();
});
