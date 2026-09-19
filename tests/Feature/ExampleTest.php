<?php

use Inertia\Testing\AssertableInertia;

test('renders the public wedding invitation', function () {
    $response = $this->get(route('home'));

    $response->assertInertia(function (AssertableInertia $page) {
        $page->component('welcome')->where('invitation.key', 'latif-aci');
    });
});
