function ballard(n) {
	var pi2 = new Decimal(0);
	var pi = 0;
	var k = 0;
	while (k < n) {
		pi2 = pi2.plus(new Decimal(-1).pow(k).div(new Decimal(1024).pow(k)).times(
			new Decimal(256).div(10 * k + 1).plus(new Decimal(1).div(10 * k + 9)).minus(new Decimal(64).div(10 * k + 3)).minus(new Decimal(32).div(4 * k + 1)).minus(new Decimal(4).div(10 * k + 5)).minus(new Decimal(4).div(10 * k + 7)).minus(new Decimal(1).div(4 * k + 3))
			));
		// pi += (Math.pow(-1, k) / Math.pow(1024, k)) * (256 / (10 * k + 1) + 1 / (10 * k + 9) - 64 / (10 * k + 3) - 32 / (4 * k + 1) - 4 / (10 * k + 5) - 4 / (10 * k + 7) - 1 / (4 * k + 3));
		k += 1;
	}
	// Correction step
	// pi = pi * 1 / Math.pow(2, 6);
	pi2 = pi2.times(new Decimal(1).div(64));
	return pi2;
}

alert(ballard(3));