class a {
    public static void main(String[] args) {
        int[][] a = { {2, 332}, {3, 4} };
        for (int k = 0; k < 4; k++) {
            System.out.print(a[k / 2][k % 2] + " ");
        }
    }
}