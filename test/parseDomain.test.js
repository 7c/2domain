"use strict";

const chai = require("chai");

const expect = chai.expect;
const parseDomain = require("../lib/parseDomain.js");

chai.config.includeStack = true;

describe("parseDomain(url)", () => {
    it("should remove the protocol", () => {
        expect(parseDomain("http://example.com")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            fulldomain: "example.com",
            hostname: "example.com",
            valid_domain: true
        });
        expect(parseDomain("//example.com")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            fulldomain: "example.com",
            hostname: "example.com",
            valid_domain: true
        });
        expect(parseDomain("https://example.com")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            fulldomain: "example.com",
            hostname: "example.com",
            valid_domain: true
        });
    });

    it("should remove sub-domains", () => {
        expect(parseDomain("www.example.com")).to.eql({
            subdomain: "www",
            domain: "example",
            tld: "com",
            valid_domain: true,
            fulldomain: "example.com",
            hostname: "www.example.com"
            
        });
        expect(parseDomain("www.some.other.subdomain.example.com")).to.eql({
            subdomain: "www.some.other.subdomain",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "www.some.other.subdomain.example.com",
            fulldomain: "example.com"
        });
    });

    it("should remove the path", () => {
        expect(parseDomain("example.com/some/path?and&query")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",

            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
        expect(parseDomain("example.com/")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });

    it("should remove the query string", () => {
        expect(parseDomain("example.com?and&query")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });

    it("should remove special characters", () => {
        expect(parseDomain("http://m.example.com\r")).to.eql({
            subdomain: "m",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "m.example.com",
            fulldomain: "example.com"
        });
    });

    it("should remove the port", () => {
        expect(parseDomain("example.com:8080")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });

    it("should remove the authentication", () => {
        expect(parseDomain("user:password@example.com")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });

    it("should allow @ characters in the path", () => {
        expect(parseDomain("https://medium.com/@username/")).to.eql({
            subdomain: "",
            domain: "medium",
            tld: "com",
            valid_domain: true,
            hostname: "medium.com",
            fulldomain: "medium.com"
        });
    });

    it("should also work with three-level domains like .co.uk", () => {
        expect(parseDomain("www.example.co.uk")).to.eql({
            subdomain: "www",
            domain: "example",
            tld: "co.uk",
            valid_domain: true,
            hostname: "www.example.co.uk",
            fulldomain: "example.co.uk"
        });
    });

    it("should not include private domains like blogspot.com by default", () => {
        expect(parseDomain("foo.blogspot.com")).to.eql({
            subdomain: "foo",
            domain: "blogspot",
            tld: "com",
            valid_domain: true,
            hostname: "foo.blogspot.com",
            fulldomain: "blogspot.com"
        });
    });

    it("should include private tlds", () => {
        expect(parseDomain("foo.blogspot.com", { privateTlds: true })).to.eql({
            subdomain: "",
            domain: "foo",
            tld: "blogspot.com",
            valid_domain: true,
            hostname: "foo.blogspot.com",
            fulldomain: "foo.blogspot.com"
        });
    });

    it("should work when all url parts are present", () => {
        expect(parseDomain("https://user@www.some.other.subdomain.example.co.uk:8080/some/path?and&query#hash")).to.eql(
            {
                subdomain: "www.some.other.subdomain",
                domain: "example",
                tld: "co.uk",
                valid_domain: true,
                hostname: "www.some.other.subdomain.example.co.uk",
                fulldomain: "example.co.uk"
            }
        );
    });

    it("should also work with the minimum", () => {
        expect(parseDomain("example.com")).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });

    it("should return null if the given url contains an unsupported top-level domain", () => {
        expect(parseDomain("example.kk")).to.equal(null);
    });

    it("should return null if the given value is not a string", () => {
        expect(parseDomain(undefined)).to.equal(null);
        expect(parseDomain({})).to.equal(null);
        expect(parseDomain("")).to.equal(null);
    });

    it("should work with domains that could match multiple tlds", () => {
        expect(parseDomain("http://hello.de.ibm.com")).to.eql({
            subdomain: "hello.de",
            domain: "ibm",
            tld: "com",
            valid_domain: true,
            hostname: "hello.de.ibm.com",
            fulldomain: "ibm.com"
        });
    });

    it("should work with custom top-level domains (eg .local)", () => {
        const options = { customTlds: ["local"] };

        expect(parseDomain("mymachine.local", options)).to.eql({
            subdomain: "",
            domain: "mymachine",
            tld: "local",
            valid_domain: true,
            hostname: "mymachine.local",
            fulldomain: "mymachine.local"
        });

        // Sanity checks if the option does not misbehave
        expect(parseDomain("mymachine.local")).to.eql(null);
        expect(parseDomain("http://example.com", options)).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });

    it("should also work with custom top-level domains passed as regexps", () => {
        const options = { customTlds: /(\.local|localhost)$/ };

        expect(parseDomain("mymachine.local", options)).to.eql({
            subdomain: "",
            domain: "mymachine",
            tld: "local",
            valid_domain: true,
            hostname: "mymachine.local",
            fulldomain: "mymachine.local"
        });
        expect(parseDomain("localhost", options)).to.eql({
            subdomain: "",
            domain: "",
            tld: "localhost",
            valid_domain: false,
            hostname: "localhost",
            fulldomain: "localhost"
        });
        expect(parseDomain("localhost:8080", options)).to.eql({
            subdomain: "",
            domain: "",
            tld: "localhost",
            valid_domain: false,
            hostname: "localhost",
            fulldomain: "localhost"
        });

        // Sanity checks if the option does not misbehave
        expect(parseDomain("mymachine.local")).to.eql(null);
        expect(parseDomain("http://example.com", options)).to.eql({
            subdomain: "",
            domain: "example",
            tld: "com",
            valid_domain: true,            
            hostname: "example.com",
            fulldomain: "example.com"
        });
    });
});
